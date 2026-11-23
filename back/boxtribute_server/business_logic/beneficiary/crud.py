from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time
from typing import Any

from peewee import JOIN, SQL, chunked, fn

from ...authz import authorized_bases_filter
from ...db import db
from ...enums import BeneficiarySortField, HumanGender, TaggableObjectType
from ...errors import DeletedBase, ResourceDoesNotExist
from ...exceptions import InvalidBeneficiaryImport
from ...graph_ql.filtering import derive_beneficiary_filter
from ...graph_ql.sorting import (
    compute_beneficiary_last_active_on,
    derive_beneficiary_sorting,
)
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.services_relation import ServicesRelation
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ...models.utils import (
    BATCH_SIZE,
    HISTORY_CREATION_MESSAGE,
    HISTORY_DELETION_MESSAGE,
    HISTORY_RECOVER_MESSAGE,
    compute_age_in_days,
    save_creation_to_history,
    save_update_to_history,
    utcnow,
)
from ..export import rows_to_csv_base64
from ..tag.crud import unassign_tags_from_resources

# Marker to distinguish a field that is not passed from an explicit null
UNSET = object()

TOKEN_TRANSFER_DESCRIPTION = "moved balance to family head"
INITIAL_CREDIT_DESCRIPTION = "initial credit"
ZERO_DATETIME = SQL("'0000-00-00 00:00:00'")
# By default, the 'deleted_on' DateTimeField is '0000-00-00 00:00:00' which evaluates
# to both NULL and NOT NULL
IS_ACTIVE = Beneficiary.deleted_on.is_null() | ~Beneficiary.deleted_on
IS_DEACTIVATED = Beneficiary.deleted_on > 0
MAX_EXPORT_SIZE = 100_000


@dataclass(kw_only=True)
class BeneficiariesResult:
    updated_beneficiaries: list[Beneficiary]
    invalid_beneficiary_ids: list[int]


@dataclass(kw_only=True)
class BeneficiariesTagsOperationResult(BeneficiariesResult):
    tag_error_info: list[dict[str, Any]]


@dataclass(kw_only=True)
class BeneficiariesServicesOperationResult(BeneficiariesResult):
    service_error_info: list[dict[str, Any]]


@dataclass(kw_only=True)
class BeneficiaryIds:
    ids: list[int]


@save_creation_to_history
def create_beneficiary(
    *,
    user_id,
    first_name,
    last_name,
    base_id,
    group_identifier,
    date_of_birth=None,
    gender=None,
    is_volunteer=False,
    registered=True,
    comment="",
    languages=None,
    family_head_id=None,
    signature=None,
    tag_ids=None,
    initial_credit=None,
    email=None,
    phone_number=None,
    custom_text_field_1=None,
    custom_text_field_2=None,
    custom_number_field=None,
    custom_date_field=None,
    now,
):
    """Insert information for a new Beneficiary in the database. Update the
    languages and tags in the corresponding cross-reference tables. If an initial
    credit is given, create a Transaction for it (attributed to the family head if the
    beneficiary is a family member).
    """
    data = dict(
        first_name=first_name,
        last_name=last_name,
        base=base_id,
        group_identifier=group_identifier,
        date_of_birth=date_of_birth,
        gender=gender or HumanGender.Diverse,  # stored as "" on DB level
        is_volunteer=bool(is_volunteer),
        not_registered=registered is not None and not registered,
        signed=signature is not None,  # set depending on signature
        comment=comment,
        family_head=family_head_id,
        created_on=now,
        created_by=user_id,
        last_modified_on=now,
        last_modified_by=user_id,
        # This is only required for compatibility with legacy DB. Never updated
        seq=1,
        # These fields are required acc. to model definition
        family_id=0,
        bicycle_ban_comment="",
        workshop_ban_comment="",
    )
    if signature is not None:
        data["signature"] = signature
        # Work-around because the DB default 0000-00-00 is not a Python date
        data["date_of_signature"] = now

    # Don't insert None for the optional fields: some of the DB columns are not nullable
    optional_data = dict(
        email=email,
        phone_number=phone_number,
        custom_text_field_1=custom_text_field_1,
        custom_text_field_2=custom_text_field_2,
        custom_number_field=custom_number_field,
        custom_date_field=custom_date_field,
    )
    data.update({k: v for k, v in optional_data.items() if v is not None})

    with db.database.atomic():
        new_beneficiary = Beneficiary.create(**data)

        if languages:
            XBeneficiaryLanguage.insert_many(
                [{"language": i, "beneficiary": new_beneficiary.id} for i in languages]
            ).execute()

        if tag_ids:
            tags_relations = [
                {
                    "object_id": new_beneficiary.id,
                    "object_type": TaggableObjectType.Beneficiary,
                    "tag": tag_id,
                    "created_on": now,
                    "created_by": user_id,
                }
                for tag_id in set(tag_ids)
            ]
            TagsRelation.insert_many(tags_relations).execute()

        if initial_credit:
            # Transactions are always attributed to family heads/individuals
            create_transaction(
                beneficiary_id=new_beneficiary.family_head_id or new_beneficiary.id,
                tokens=initial_credit,
                description=INITIAL_CREDIT_DESCRIPTION,
                user_id=user_id,
                now=now,
            )

    return new_beneficiary


@save_update_to_history(
    fields=[
        Beneficiary.first_name,
        Beneficiary.last_name,
        Beneficiary.not_registered,
        Beneficiary.is_volunteer,
        Beneficiary.comment,
        Beneficiary.group_identifier,
        Beneficiary.date_of_signature,
        Beneficiary.date_of_birth,
        Beneficiary.gender,
        Beneficiary.signed,
        Beneficiary.family_head_id,  # type: ignore[attr-defined]
        Beneficiary.email,
        Beneficiary.phone_number,
        Beneficiary.custom_text_field_1,
        Beneficiary.custom_text_field_2,
        Beneficiary.custom_number_field,
        Beneficiary.custom_date_field,
    ],
)
def update_beneficiary(
    *,
    user_id,
    beneficiary,
    id,
    gender=None,
    languages=None,
    family_head_id=UNSET,
    registered=None,
    signature=None,
    tag_ids=None,
    now,
    **data,
):
    """Update fields of existing beneficiary, including the language and tag
    cross-references. The family head is only updated if specified (None turns the
    beneficiary into an individual).
    When a beneficiary that has not been part of a family joins one, their credit is
    transferred to the new family head.
    The caller must ensure that the update is valid.
    Insert timestamp for modification and return the beneficiary.
    """
    # Handle any items with keys not matching the Model fields
    if gender is not None:
        beneficiary.gender = gender

    if registered is not None:
        beneficiary.not_registered = not registered

    if signature is not None:
        beneficiary.signed = True
        beneficiary.signature = signature
        beneficiary.date_of_signature = now

    # Set first_name, last_name, group_identifier, date_of_birth, comment, is_volunteer,
    # email, phone_number, custom fields if specified via GraphQL input. Only the
    # (nullable) date of birth and comment can be set to None
    for field, value in data.items():
        if value is None and field not in ("date_of_birth", "comment"):
            continue
        if field == "custom_date_field":
            value = datetime.combine(value, time.min)
        setattr(beneficiary, field, value)

    if family_head_id is not UNSET and family_head_id != beneficiary.family_head_id:
        _lock_beneficiaries(
            [beneficiary.id, beneficiary.family_head_id, family_head_id]
        )
        if family_head_id is not None and beneficiary.family_head_id is None:
            transfer_balances(
                user_id=user_id,
                source_ids=[beneficiary.id],
                target_id=family_head_id,
                now=now,
            )
        beneficiary.family_head = family_head_id

    with db.database.atomic():
        if languages is not None:
            XBeneficiaryLanguage.delete().where(
                XBeneficiaryLanguage.beneficiary == id
            ).execute()
            if languages:
                XBeneficiaryLanguage.insert_many(
                    [{"language": lid, "beneficiary": id} for lid in languages]
                ).execute()

        if tag_ids is not None and _update_tags(
            user_id=user_id,
            beneficiary_id=beneficiary.id,
            tag_ids=set(tag_ids),
            now=now,
        ):
            beneficiary.last_modified_on = now
            beneficiary.last_modified_by = user_id

    return beneficiary


def _lock_beneficiaries(ids):
    """Lock the rows of the given beneficiaries until the surrounding transaction ends,
    and return their current state. This serializes concurrent changes to their tokens,
    family and tags. Rows are locked in ascending ID order to avoid deadlocks.
    Must be called inside `db.database.atomic()`.
    """
    ids = sorted({i for i in ids if i is not None})
    if not ids:
        return []
    return list(
        Beneficiary.select()
        .where(Beneficiary.id << ids)
        .order_by(Beneficiary.id)
        .for_update()
    )


def _update_tags(*, user_id, beneficiary_id, tag_ids, now):
    """Compare the beneficiary's assigned tags and the given tag IDs. Un-assign tags
    that are not in the given set, and assign tags that are not yet assigned.
    Return True if any tags were changed.
    """
    _lock_beneficiaries([beneficiary_id])
    assigned_tag_ids = _assigned_tag_ids([beneficiary_id])[beneficiary_id]
    removed = assigned_tag_ids - tag_ids
    added = tag_ids - assigned_tag_ids

    if removed:
        unassign_tags_from_resources(
            user_id=user_id,
            model=Beneficiary,
            object_type=TaggableObjectType.Beneficiary,
            resource_ids=[beneficiary_id],
            tag_ids=removed,
            now=now,
        )
    if added:
        TagsRelation.insert_many(
            [
                {
                    "object_id": beneficiary_id,
                    "object_type": TaggableObjectType.Beneficiary,
                    "tag": tag_id,
                    "created_on": now,
                    "created_by": user_id,
                }
                for tag_id in sorted(added)
            ]
        ).execute()
    return bool(removed or added)


def _assigned_tag_ids(beneficiary_ids, tag_ids=None):
    """Return mapping of beneficiary IDs to the set of IDs of their assigned tags
    (optionally restricted to the given tag IDs).
    """
    conditions = [
        TagsRelation.object_id << list(beneficiary_ids),
        TagsRelation.object_type == TaggableObjectType.Beneficiary,
        TagsRelation.deleted_on.is_null(),
    ]
    if tag_ids is not None:
        conditions.append(TagsRelation.tag << list(tag_ids))

    assigned = defaultdict(set)
    relations = TagsRelation.select(TagsRelation.object_id, TagsRelation.tag).where(
        *conditions
    )
    for object_id, tag_id in relations.tuples():
        assigned[object_id].add(tag_id)
    return assigned


def create_transaction(
    *,
    beneficiary_id=None,
    count=0,
    description="",
    product_id=None,
    tokens=0,
    user_id,
    now=None,
):
    """Insert information for a new Transaction in the database."""
    with db.database.atomic():
        _lock_beneficiaries([beneficiary_id])
        return Transaction.create(
            beneficiary=beneficiary_id,
            count=count,
            description=description,
            tokens=tokens,
            product=product_id,
            created_on=now or utcnow(),
            created_by=user_id,
        )


def transfer_balances(*, user_id, source_ids, target_id, now):
    """Move the token balance of the source beneficiaries to the target beneficiary.
    A Transaction with negative value is created for every source, and a single
    Transaction with the positive total value for the target. Nothing is created for
    sources with balance 0.
    """
    with db.database.atomic():
        _lock_beneficiaries([*source_ids, target_id])
        # Locking read so that the sums include all committed transactions
        balances = {
            beneficiary_id: int(total)
            for beneficiary_id, total in Transaction.select(
                Transaction.beneficiary, fn.SUM(Transaction.tokens)
            )
            .where(Transaction.beneficiary << list(source_ids))
            .group_by(Transaction.beneficiary)
            .for_update()
            .tuples()
            if total
        }

        def transaction(beneficiary_id, tokens):
            return dict(
                beneficiary=beneficiary_id,
                count=0,
                description=TOKEN_TRANSFER_DESCRIPTION,
                tokens=tokens,
                product=None,
                created_on=now,
                created_by=user_id,
            )

        transactions = [
            transaction(beneficiary_id, -balance)
            for beneficiary_id, balance in sorted(balances.items())
        ]
        if total := sum(balances.values()):
            transactions.append(transaction(target_id, total))

        for chunk in chunked(transactions, BATCH_SIZE):
            Transaction.insert_many(chunk).execute()


def find_beneficiaries(ids, *conditions):
    """Select the (non-deactivated if no other conditions given) beneficiaries with
    given IDs that the user is allowed to access, and match the given conditions.
    Return the list of beneficiaries sorted by ID, and the sorted list of IDs that
    could not be found.
    """
    ids = set(ids)
    if not ids:
        return [], []

    beneficiaries = list(
        Beneficiary.select()
        .where(
            Beneficiary.id << ids,
            authorized_bases_filter(Beneficiary),
            *(conditions or [IS_ACTIVE]),
        )
        .order_by(Beneficiary.id)
    )
    return beneficiaries, sorted(ids.difference(b.id for b in beneficiaries))


def _refetch_beneficiaries(ids):
    # Re-fetch updated data because the passed objects would be outdated
    ids = list(ids)
    if not ids:
        return []
    return list(
        Beneficiary.select().where(Beneficiary.id << ids).order_by(Beneficiary.id)
    )


def _update_beneficiaries(ids, *, user_id, now, **fields):
    for chunk in chunked(sorted(ids), BATCH_SIZE):
        Beneficiary.update(
            last_modified_on=now, last_modified_by=user_id, **fields
        ).where(Beneficiary.id << chunk).execute()


def _history_entries(ids, *, changes, user_id, now):
    return [
        DbChangeHistory(
            changes=changes,
            table_name=Beneficiary._meta.table_name,
            record_id=beneficiary_id,
            user=user_id,
            change_date=now,
        )
        for beneficiary_id in sorted(ids)
    ]


def _family_head_history_entries(beneficiaries, *, new_head_id, user_id, now):
    return [
        DbChangeHistory(
            changes=Beneficiary.family_head.column_name,
            table_name=Beneficiary._meta.table_name,
            record_id=beneficiary.id,
            user=user_id,
            change_date=now,
            from_int=beneficiary.family_head_id,
            to_int=new_head_id,
        )
        for beneficiary in beneficiaries
    ]


def missing_tag_ids(beneficiary_ids, tag_ids):
    """Return mapping of beneficiary IDs to the set of IDs of those of the given tags
    that are not yet assigned to the beneficiary.
    """
    assigned = _assigned_tag_ids(beneficiary_ids, tag_ids)
    return {i: set(tag_ids) - assigned[i] for i in beneficiary_ids}


def assigned_tag_ids(beneficiary_ids, tag_ids):
    """Return mapping of beneficiary IDs to the set of IDs of those of the given tags
    that are assigned to the beneficiary.
    """
    assigned = _assigned_tag_ids(beneficiary_ids, tag_ids)
    return {i: assigned[i] for i in beneficiary_ids}


def assign_tags_to_beneficiaries(*, user_id, beneficiary_ids, tag_ids, now):
    """Assign the given tags to the beneficiaries. Tags that a beneficiary is already
    assigned to are skipped. Return the list of updated beneficiaries.
    """
    beneficiary_ids = sorted(beneficiary_ids)
    with db.database.atomic():
        _lock_beneficiaries(beneficiary_ids)
        assigned = _assigned_tag_ids(beneficiary_ids, tag_ids)
        relations = [
            {
                "object_id": beneficiary_id,
                "object_type": TaggableObjectType.Beneficiary,
                "tag": tag_id,
                "created_on": now,
                "created_by": user_id,
            }
            for beneficiary_id in beneficiary_ids
            for tag_id in sorted(tag_ids)
            if tag_id not in assigned[beneficiary_id]
        ]
        for chunk in chunked(relations, BATCH_SIZE):
            TagsRelation.insert_many(chunk).execute()
        _update_beneficiaries(beneficiary_ids, user_id=user_id, now=now)
    return _refetch_beneficiaries(beneficiary_ids)


def deactivate_beneficiaries(*, user_id, beneficiaries, now):
    """Soft-delete the given beneficiaries by setting the `deleted_on` field. All
    (active) family members of any family head in the list are deactivated, too. Log
    every deactivation in the history table.
    Return the list of deactivated beneficiaries (including the family members).
    """
    ids = {b.id for b in beneficiaries}
    if not ids:
        return []

    members = Beneficiary.select(Beneficiary.id).where(
        Beneficiary.family_head << list(ids), IS_ACTIVE
    )
    ids.update(member.id for member in members)

    with db.database.atomic():
        _update_beneficiaries(ids, user_id=user_id, now=now, deleted_on=now)
        history_entries = _history_entries(
            ids, changes=HISTORY_DELETION_MESSAGE, user_id=user_id, now=now
        )
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)
    return _refetch_beneficiaries(ids)


def reactivate_beneficiaries(*, user_id, beneficiaries, now):
    """Reactivate the given (deactivated) beneficiaries in two passes: family heads and
    individuals first, then the family members. All deactivated family members of any
    family head in the list are reactivated, too. Log every reactivation in the
    history table.
    Return the list of reactivated beneficiaries (including the family members).
    """
    head_ids = {b.id for b in beneficiaries if b.family_head_id is None}
    member_ids = {b.id for b in beneficiaries if b.family_head_id is not None}
    if head_ids:
        cascaded_members = Beneficiary.select(Beneficiary.id).where(
            Beneficiary.family_head << list(head_ids), IS_DEACTIVATED
        )
        member_ids.update(member.id for member in cascaded_members)

    with db.database.atomic():
        for ids in (head_ids, member_ids):
            if not ids:
                continue
            _update_beneficiaries(
                ids, user_id=user_id, now=now, deleted_on=ZERO_DATETIME
            )
            history_entries = _history_entries(
                ids, changes=HISTORY_RECOVER_MESSAGE, user_id=user_id, now=now
            )
            DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)
    return _refetch_beneficiaries(head_ids | member_ids)


def register_services_for_beneficiaries(*, user_id, beneficiary_ids, service_ids, now):
    """Create a ServicesRelation for each pair of beneficiary and service. A
    beneficiary may use a service multiple times.
    Return the list of beneficiaries.
    """
    beneficiary_ids = sorted(beneficiary_ids)
    relations = [
        {
            "beneficiary": beneficiary_id,
            "service": service_id,
            "created_on": now,
            "created_by": user_id,
        }
        for beneficiary_id in beneficiary_ids
        for service_id in sorted(service_ids)
    ]
    with db.database.atomic():
        for chunk in chunked(relations, BATCH_SIZE):
            ServicesRelation.insert_many(chunk).execute()
    return _refetch_beneficiaries(beneficiary_ids)


def merge_beneficiaries_into_family(*, user_id, beneficiaries, now):
    """Merge the given family heads/individuals (sorted in input order) into a family.
    The oldest one (by date of birth; beneficiaries without date of birth come last;
    then by creation date, then by input order) becomes the new family head. All
    members of the other beneficiaries are moved under the new head, too. The credit of
    the other beneficiaries is transferred to the new head.
    Return the list of beneficiaries whose family head was updated.
    """
    _, new_head = min(
        enumerate(beneficiaries),
        key=lambda item: (
            item[1].date_of_birth is None,
            item[1].date_of_birth or date.max,
            item[1].created_on or datetime.max,
            item[0],
        ),
    )
    others = [b for b in beneficiaries if b.id != new_head.id]
    other_ids = [b.id for b in others]

    with db.database.atomic():
        _lock_beneficiaries([b.id for b in beneficiaries])
        # Read the members under lock so that concurrent family changes are not missed
        members = list(Beneficiary.select().where(Beneficiary.family_head << other_ids))
        moved = others + members
        moved_ids = {b.id for b in moved}

        transfer_balances(
            user_id=user_id, source_ids=other_ids, target_id=new_head.id, now=now
        )
        _update_beneficiaries(
            moved_ids, user_id=user_id, now=now, family_head=new_head.id
        )
        _update_beneficiaries([new_head.id], user_id=user_id, now=now)
        history_entries = _family_head_history_entries(
            moved, new_head_id=new_head.id, user_id=user_id, now=now
        )
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)
    return _refetch_beneficiaries(moved_ids)


def detach_beneficiaries_from_family(*, user_id, beneficiaries, now):
    """Remove the given family members from their families, turning them into
    individuals. No credit is transferred.
    Return the list of detached beneficiaries.
    """
    with db.database.atomic():
        # Use the rows as locked in the database because their family head may have
        # been changed concurrently. The old heads are locked as well
        locked = _lock_beneficiaries(b.id for b in beneficiaries)
        _lock_beneficiaries(b.family_head_id for b in locked)
        ids = {b.id for b in locked}
        _update_beneficiaries(ids, user_id=user_id, now=now, family_head=None)
        history_entries = _family_head_history_entries(
            locked, new_head_id=None, user_id=user_id, now=now
        )
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)
    return _refetch_beneficiaries(ids)


def get_beneficiary_ids(base_id, filters=None):
    """Return IDs of all beneficiaries in the given base (max. 100,000), taking filters
    into account.
    """
    conditions, selection = derive_beneficiary_filter(
        filters, Beneficiary.select(Beneficiary.id)
    )
    beneficiaries = (
        selection.where(Beneficiary.base == base_id, *conditions)
        .order_by(Beneficiary.id)
        .limit(MAX_EXPORT_SIZE)
    )
    return BeneficiaryIds(ids=[b.id for b in beneficiaries])


def _protect_against_formula_injection(value):
    """Prefix values that spreadsheet software interprets as formula."""
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return f"'{value}"
    return value


def export_beneficiary_rows_to_csv(base_id, filters=None):
    """Serialize data of all beneficiaries in the given base (max. 100,000) as CSV,
    taking filters into account.
    """
    base = Base.get_by_id(base_id)
    tags = {
        tag.id: tag.name
        for tag in Tag.select(Tag.id, Tag.name).where(Tag.base == base_id)
    }

    conditions, selection = derive_beneficiary_filter(
        filters, Beneficiary.select(Beneficiary.id)
    )
    selected_ids = selection.where(Beneficiary.base == base_id, *conditions)
    tag_ids = (
        TagsRelation.select(fn.GROUP_CONCAT(TagsRelation.tag))
        .where(
            TagsRelation.object_id == Beneficiary.id,
            TagsRelation.object_type == TaggableObjectType.Beneficiary,
            TagsRelation.deleted_on.is_null(),
        )
        .alias("tag_ids")
    )
    age = fn.IF(
        Beneficiary.date_of_birth > 0,
        fn.TIMESTAMPDIFF(SQL("YEAR"), Beneficiary.date_of_birth, fn.CURDATE()),
        None,
    ).alias("age")
    raw_beneficiaries = (
        Beneficiary.select(
            Beneficiary.id,
            Beneficiary.group_identifier,
            Beneficiary.first_name,
            Beneficiary.last_name,
            Beneficiary.gender,
            age,
            Beneficiary.family_head,
            Beneficiary.comment,
            tag_ids,
        )
        .where(Beneficiary.id << selected_ids)
        .order_by(Beneficiary.id)
        .limit(MAX_EXPORT_SIZE)
        .dicts()
        .iterator()
    )

    group_identifier_header = base.group_identifier or "Group identifier"
    fieldnames = [
        group_identifier_header,
        "Firstname",
        "Surname",
        "Gender",
        "Age",
        "Tags",
        "Comments",
        "Boxtribute family ID",
        "Head of family",
    ]
    protect = _protect_against_formula_injection
    rows = (
        {
            group_identifier_header: protect(b["group_identifier"]),
            "Firstname": protect(b["first_name"]),
            "Surname": protect(b["last_name"]),
            "Gender": b["gender"].value if b["gender"] else "",
            "Age": b["age"],
            "Tags": protect(
                ",".join(tags[int(i)] for i in b["tag_ids"].split(","))
                if b["tag_ids"]
                else ""
            ),
            "Comments": protect(b["comment"]),
            "Boxtribute family ID": b["family_head"] or b["id"],
            "Head of family": "no" if b["family_head"] else "yes",
        }
        for b in raw_beneficiaries
    )
    return rows_to_csv_base64(fieldnames, rows)


def get_beneficiaries_page(base_id, *, page=None, page_size=None, **options):
    page = page or 1
    page_size = max(min(50 if page_size is None else page_size, 100), 1)
    return _get_beneficiaries_page(base_id, page=page, page_size=page_size, **options)


def _get_beneficiaries_page(
    base_id, *, page, page_size, filters=None, sort_by=None, descending=None
):
    """Internal function. Build and execute a peewee query for a page of
    BeneficiaryRow data, taking given filters and sorting into account.

    A page always consists of exactly `page_size` beneficiaries (family heads and
    members alike). For the default sort field (LastName), beneficiaries are sorted
    by their family head's last name (or their own last name, if they're a family
    head themselves); within the same last name the relative order is unspecified
    (ties are broken by ascending ID, purely to make pagination deterministic). This
    intentionally groups a family's members near their family head without
    guaranteeing that the whole family ends up on the same page.
    """
    sort_by = sort_by or BeneficiarySortField.LastName

    conditions, base_selection = derive_beneficiary_filter(
        filters, Beneficiary.select(Beneficiary.id)
    )
    base_selection = base_selection.where(Beneficiary.base == base_id, *conditions)

    # The total always reflects the number of filtered beneficiaries
    total_number_of_beneficiaries = (
        Beneficiary.select(fn.COUNT(Beneficiary.id.distinct()))
        .where(Beneficiary.id << base_selection)
        .scalar()
    )

    def order(field):
        is_descending = bool(descending)
        if sort_by == BeneficiarySortField.Age:
            # smallest (earliest) date of birth means largest age
            return field.asc() if is_descending else field.desc()
        return field.desc() if is_descending else field.asc()

    # Inner query: sort and page on IDs only. The sort key is selected as well in
    # order to sort the page rows of the outer query (and to be compatible with
    # DISTINCT, which may be added to the selection while deriving filters)
    selection, sort_field = derive_beneficiary_sorting(base_selection, sort_by)
    page_ids = (
        selection.columns(Beneficiary.id, sort_field.alias("sort_key"))
        .order_by(order(sort_field), Beneficiary.id.asc())
        .paginate(page, page_size)
        .alias("s")
    )

    # Correlated subqueries for tag IDs and tokens, evaluated for the page_size rows
    # only
    tag_ids = (
        TagsRelation.select(fn.GROUP_CONCAT(TagsRelation.tag))
        .where(
            TagsRelation.object_id == page_ids.c.id,
            TagsRelation.object_type == TaggableObjectType.Beneficiary,
            TagsRelation.deleted_on.is_null(),
        )
        .alias("tag_ids")
    )
    tokens = (
        Transaction.select(fn.COALESCE(fn.SUM(Transaction.tokens), 0)).where(
            Transaction.beneficiary == page_ids.c.id
        )
    ).alias("tokens")

    # Aliases for the outer query
    B = Beneficiary.alias("b")
    Head = Beneficiary.alias("head")  # the beneficiary's family head, if any

    last_active_on = compute_beneficiary_last_active_on(B)
    # Explicitly cast to an integer: depending on the MySQL column types involved
    # (e.g. if days_to_keep_inactive_beneficiaries ever ends up as a DECIMAL/NUMERIC
    # in production), the raw comparison/COALESCE result may otherwise be returned
    # to the client (and reported by the DB driver) as a Decimal instead of a 0/1
    # integer, which the GraphQL Boolean scalar then refuses to serialize
    soon_to_be_deactivated = fn.COALESCE(
        fn.DATEDIFF(fn.CURDATE(), last_active_on)
        > (Base.days_to_keep_inactive_beneficiaries - 14),
        False,
    ).cast("unsigned")
    family_head_last_name = fn.COALESCE(Head.last_name, B.last_name)

    rows = (
        B.select(
            B.id,
            B.first_name.alias("first_name"),
            B.last_name.alias("last_name"),
            B.gender.alias("gender"),
            fn.IF(
                B.date_of_birth > 0,
                compute_age_in_days(B.date_of_birth),
                None,
            ).alias("age"),
            B.family_head.alias("family_head_id"),
            family_head_last_name.alias("family_head_last_name"),
            B.group_identifier.alias("group_identifier"),
            tokens,
            tag_ids,
            B.comment.alias("comment"),
            last_active_on.alias("last_active_on"),
            B.created_on.alias("created_on"),
            B.email.alias("email"),
            B.phone_number.alias("phone_number"),
            B.custom_text_field_1.alias("custom_text_field_1"),
            B.custom_text_field_2.alias("custom_text_field_2"),
            B.custom_number_field.alias("custom_number_field"),
            B.custom_date_field.alias("custom_date_field"),
            soon_to_be_deactivated.alias("soon_to_be_deactivated"),
            B.signed.alias("signed"),
        )
        .from_(page_ids)
        .join(B, on=(B.id == page_ids.c.id))
        .join(Base, on=(Base.id == B.base))
        .join(Head, JOIN.LEFT_OUTER, on=(Head.id == B.family_head))
        .order_by(order(page_ids.c.sort_key), B.id.asc())
        .dicts()
        .iterator()
    )

    return {
        "page": rows,
        "total_number_of_beneficiaries": total_number_of_beneficiaries,
    }


class BeneficiariesResults(dict):
    pass


def sanitize_input(data):
    sanitized_data = []
    all_tag_ids = []
    for entry in data:
        if "registered" in entry:
            entry["not_registered"] = not entry.pop("registered")
        # Remove tag IDs from input because they're inserted into a different table
        tag_ids = set(entry.pop("tag_ids", []))  # remove duplicated IDs
        all_tag_ids.append(tag_ids)
        sanitized_data.append(entry)
    return sanitized_data, all_tag_ids


def validate_imported_beneficiaries(input_data, imported_entries):
    """Simple validation of imported data (compare that input values match stored
    values). Any invalid fields are returned as list including the mismatching values,
    mapped the index of the row they appear on.
    """
    fields = [
        "first_name",
        "last_name",
        "date_of_birth",
        "gender",
        "is_volunteer",
        "not_registered",
        "phone_number",
        "group_identifier",
        "comment",
    ]
    invalid_fields = defaultdict(list)
    i = 0
    for input_element, imported_entry in zip(input_data, imported_entries):
        for field in fields:
            input_value = input_element[field]
            imported_value = getattr(imported_entry, field)
            if field == "gender":
                if input_value is None and imported_value != HumanGender.Diverse:
                    invalid_fields[i].append(
                        {field: [input_value, imported_value.name]}
                    )
            elif input_value != imported_value:
                invalid_fields[i].append({field: [input_value, imported_value]})
        if input_element["base"] != imported_entry.base_id:
            invalid_fields[i].append(
                {"base": [input_element["base"], imported_entry.base_id]}
            )
        i += 1
    return invalid_fields


def create_beneficiaries(
    *,
    user_id,
    base_id,
    beneficiary_data,
):
    """Insert multiple beneficiaries and their tags into the database."""
    if len(beneficiary_data) == 0:
        return BeneficiariesResults({"results": []})

    # If the base doesn't exist, the authz checks in the parent resolver will fail.
    # But let's check again anyways in case this function is called elsewhere
    base = Base.get_or_none(Base.id == base_id)
    if base is None:
        return ResourceDoesNotExist(name="Base", id=base_id)
    if base.deleted_on is not None:
        return DeletedBase(name=base.name)

    sanitized_data, all_tag_ids = sanitize_input(beneficiary_data)
    now = utcnow()
    default_and_common_elements = {
        # defaults
        "last_name": "",
        "date_of_birth": None,
        "gender": None,  # will be converted to '' on DB level
        "comment": "",
        "is_volunteer": False,
        "not_registered": False,
        "phone_number": None,
        # common data
        "base": base_id,
        "created_on": now,
        "created_by": user_id,
    }
    complete_data = [
        {**default_and_common_elements, **beneficiary_entry}
        for beneficiary_entry in sanitized_data
    ]

    with db.database.atomic():
        first_inserted_id = Beneficiary.insert_many(complete_data).execute()
        beneficiaries = list(
            Beneficiary.select().where(
                Beneficiary.id >= first_inserted_id,
                Beneficiary.id < first_inserted_id + len(complete_data),
            )
        )
        if invalid_fields := validate_imported_beneficiaries(
            complete_data, beneficiaries
        ):
            raise InvalidBeneficiaryImport(invalid_fields=invalid_fields)

        history_entries = [
            DbChangeHistory(
                changes=HISTORY_CREATION_MESSAGE,
                table_name=Beneficiary._meta.table_name,
                record_id=beneficiary.id,
                user=user_id,
                change_date=now,
            )
            for beneficiary in beneficiaries
        ]
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)

        tags_relations = [
            {
                "object_id": beneficiary.id,
                "object_type": TaggableObjectType.Beneficiary,
                "tag": tag_id,
                "created_on": now,
                "created_by": user_id,
            }
            for beneficiary, tag_ids in zip(beneficiaries, all_tag_ids)
            for tag_id in tag_ids
        ]
        TagsRelation.insert_many(tags_relations).execute()

        return BeneficiariesResults({"results": beneficiaries})
