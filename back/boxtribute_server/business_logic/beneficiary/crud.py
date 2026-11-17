from collections import defaultdict

from peewee import fn

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
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ...models.utils import (
    BATCH_SIZE,
    HISTORY_CREATION_MESSAGE,
    compute_age_in_days,
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
    today,
    utcnow,
)


@save_creation_to_history
def create_beneficiary(
    *,
    user_id,
    first_name,
    last_name,
    base_id,
    group_identifier,
    date_of_birth,
    gender,
    is_volunteer,
    registered,
    comment="",
    languages=None,
    family_head_id=None,
    signature=None,
    date_of_signature=None,
    tag_ids=None,
    now,
):
    """Insert information for a new Beneficiary in the database. Update the
    languages in the corresponding cross-reference table.
    """
    data = dict(
        first_name=first_name,
        last_name=last_name,
        base=base_id,
        group_identifier=group_identifier,
        date_of_birth=date_of_birth,
        gender=gender,
        is_volunteer=is_volunteer,
        not_registered=not registered,
        signed=signature is not None,  # set depending on signature
        comment=comment,
        family_head=None,
        created_on=now,
        created_by=user_id,
        last_modified_on=now,
        last_modified_by=user_id,
        # This is only required for compatibility with legacy DB
        seq=1 if family_head_id is None else 2,
        # These fields are required acc. to model definition
        family_id=0,
        bicycle_ban_comment="",
        workshop_ban_comment="",
    )
    if date_of_signature is not None:
        # Work-around because the DB default 0000-00-00 is not a Python date
        data["date_of_signature"] = date_of_signature

    with db.database.atomic():
        new_beneficiary = Beneficiary.create(**data)

        language_ids = languages or []
        XBeneficiaryLanguage.insert_many(
            [{"language": i, "beneficiary": new_beneficiary.id} for i in language_ids]
        ).execute()

        if tag_ids:
            # Don't use assign_tag() because it requires an existing Beneficiary object,
            # however the Beneficiary creation has not yet been committed to the DB
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
        Beneficiary.phone_number,
    ],
)
def update_beneficiary(
    *,
    user_id,
    beneficiary,
    id,
    gender=None,
    languages=None,
    family_head_id=None,
    registered=None,
    signature=None,
    now,
    **data,
):
    """Look up an existing Beneficiary given an ID, and update all requested fields,
    including the language cross-reference.
    Insert timestamp for modification and return the beneficiary.
    """
    # Handle any items with keys not matching the Model fields
    if gender is not None:
        beneficiary.gender = gender

    if family_head_id is not None:
        beneficiary.family_head = None
    beneficiary.seq = 1 if family_head_id is None else 2

    if registered is not None:
        beneficiary.not_registered = not registered

    if signature is not None:
        beneficiary.signed = True
        beneficiary.signature = signature

    # Set first_name, last_name, group_identifier, date_of_birth, comment, is_volunteer,
    # date_of_signature if specified via GraphQL input
    for field, value in data.items():
        setattr(beneficiary, field, value)

    with db.database.atomic():
        language_ids = languages or []
        if language_ids:
            XBeneficiaryLanguage.delete().where(
                XBeneficiaryLanguage.beneficiary == id
            ).execute()
            XBeneficiaryLanguage.insert_many(
                [{"language": lid, "beneficiary": id} for lid in language_ids]
            ).execute()

    return beneficiary


@safely_handle_deletion
def deactivate_beneficiary(*, beneficiary, **_):
    if beneficiary.family_head_id is None:
        # Deactivate all children of a parent
        children = Beneficiary.select().where(
            Beneficiary.family_head == beneficiary.id,
            (Beneficiary.deleted_on.is_null() | ~Beneficiary.deleted_on),
        )
        for child in children:
            deactivate_beneficiary(beneficiary=child)
    return beneficiary


def create_transaction(
    *,
    beneficiary_id=None,
    count=0,
    description="",
    product_id=None,
    tokens=0,
    user_id,
):
    """Insert information for a new Transaction in the database."""
    return Transaction.create(
        beneficiary=beneficiary_id,
        count=count,
        description=description,
        tokens=tokens,
        product=product_id,
        created_on=utcnow(),
        created_by=user_id,
    )


def get_beneficiaries_page(base_id, *, page=None, page_size=None, **options):
    page = page or 1
    page_size = max(min(50 if page_size is None else page_size, 100), 1)
    return _get_beneficiaries_page(base_id, page=page, page_size=page_size, **options)


def _get_beneficiaries_page(
    base_id, *, page, page_size, filters=None, sort_by=None, descending=None
):
    """Internal function. Build and execute a peewee query for a page of
    BeneficiaryRow data, taking given filters and sorting into account.

    If sorting by last name (the default), a page consists of `page_size` family
    heads (beneficiaries without a family head of their own) plus all of their family
    members; the total number of returned rows may thus exceed `page_size`.
    For any other sort field, a page consists of exactly `page_size` beneficiaries
    (family heads and members alike), sorted by the specified field.
    """
    sort_by = sort_by or BeneficiarySortField.LastName

    base_selection = Beneficiary.select(Beneficiary.id)
    conditions, base_selection = derive_beneficiary_filter(filters, base_selection)
    base_selection = base_selection.where(
        Beneficiary.base == base_id,
        (Beneficiary.deleted_on.is_null() | (Beneficiary.deleted_on == 0)),
        *conditions,
    )

    # The total always reflects the number of filtered beneficiaries, never families,
    # independent of the page_ids/sort_key_by_id computed below
    total_number_of_beneficiaries = (
        Beneficiary.select(fn.COUNT(Beneficiary.id.distinct()))
        .where(Beneficiary.id << base_selection)
        .scalar()
    )

    def order(field):
        # Unlike BoxRowOptions, descending order is not the default here
        is_descending = bool(descending)
        if sort_by == BeneficiarySortField.Age:
            # smallest (earliest) date of birth means largest age
            return field.asc() if is_descending else field.desc()
        return field.desc() if is_descending else field.asc()

    if sort_by == BeneficiarySortField.LastName:
        heads_selection = base_selection.where(Beneficiary.family_head.is_null())
        sorted_selection, sort_field = derive_beneficiary_sorting(
            heads_selection, sort_by
        )
        head_rows = list(
            sorted_selection.columns(Beneficiary.id, sort_field.alias("sort_key"))
            .order_by(order(sort_field), Beneficiary.id.asc())
            .paginate(page, page_size)
            .dicts()
        )
        head_ids = [row["id"] for row in head_rows]
        position_by_id = {head_id: idx for idx, head_id in enumerate(head_ids)}

        member_rows = (
            list(
                Beneficiary.select(Beneficiary.id, Beneficiary.family_head)
                .where(
                    Beneficiary.family_head << head_ids,
                    (Beneficiary.deleted_on.is_null() | (Beneficiary.deleted_on == 0)),
                )
                .dicts()
            )
            if head_ids
            else []
        )

        ids = head_ids + [row["id"] for row in member_rows]
        # Members are ordered right after their family head; heads are ordered
        # before their members
        sort_key_by_id = {
            head_id: (idx, 0, head_id) for head_id, idx in position_by_id.items()
        }
        sort_key_by_id.update(
            {
                row["id"]: (position_by_id[row["family_head"]], 1, row["id"])
                for row in member_rows
            }
        )
    else:
        sorted_selection, sort_field = derive_beneficiary_sorting(
            base_selection, sort_by
        )
        rows = list(
            sorted_selection.columns(Beneficiary.id, sort_field.alias("sort_key"))
            .order_by(order(sort_field), Beneficiary.id.asc())
            .paginate(page, page_size)
            .dicts()
        )
        ids = [row["id"] for row in rows]
        sort_key_by_id = {row["id"]: idx for idx, row in enumerate(rows)}

    if not ids:
        return {
            "page": [],
            "total_number_of_beneficiaries": total_number_of_beneficiaries,
        }

    tag_ids = (
        TagsRelation.select(fn.GROUP_CONCAT(TagsRelation.tag))
        .where(
            TagsRelation.object_id == Beneficiary.id,
            TagsRelation.object_type == TaggableObjectType.Beneficiary,
            TagsRelation.deleted_on.is_null(),
        )
        .alias("tag_ids")
    )
    tokens = (
        Transaction.select(fn.COALESCE(fn.SUM(Transaction.tokens), 0)).where(
            Transaction.beneficiary == Beneficiary.id
        )
    ).alias("tokens")
    last_active_on = compute_beneficiary_last_active_on(Beneficiary)
    soon_to_be_deactivated = fn.DATEDIFF(today.strftime("%Y-%m-%d"), last_active_on) > (
        Base.days_to_keep_inactive_beneficiaries - 14
    )

    rows = (
        Beneficiary.select(
            Beneficiary.id,
            Beneficiary.first_name.alias("first_name"),
            Beneficiary.last_name.alias("last_name"),
            Beneficiary.gender.alias("gender"),
            fn.IF(
                Beneficiary.date_of_birth > 0,
                compute_age_in_days(Beneficiary.date_of_birth),
                None,
            ).alias("age"),
            Beneficiary.family_head.alias("family_head_id"),
            Beneficiary.group_identifier.alias("group_identifier"),
            tokens,
            tag_ids,
            Beneficiary.comment.alias("comment"),
            last_active_on.alias("last_active_on"),
            Beneficiary.created_on.alias("created_on"),
            Beneficiary.email.alias("email"),
            Beneficiary.phone_number.alias("phone_number"),
            Beneficiary.custom_text_field_1.alias("custom_text_field_1"),
            Beneficiary.custom_text_field_2.alias("custom_text_field_2"),
            Beneficiary.custom_number_field.alias("custom_number_field"),
            Beneficiary.custom_date_field.alias("custom_date_field"),
            soon_to_be_deactivated.alias("soon_to_be_deactivated"),
            Beneficiary.signed.alias("signed"),
        )
        .join(Base, on=(Base.id == Beneficiary.base))
        .where(Beneficiary.id << ids)
        .dicts()
        .execute()
    )
    rows = sorted(rows, key=lambda row: sort_key_by_id[row["id"]])

    return {
        "page": rows,
        "total_number_of_beneficiaries": total_number_of_beneficiaries,
    }


class BeneficiariesResult(dict):
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
        return BeneficiariesResult({"results": []})

    # If the base doesn't exist, the authz checks in the parent resolver will fail.
    # But let's check again anyways in case this function is called elsewhere
    base = Base.get_or_none(base_id)
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

        return BeneficiariesResult({"results": beneficiaries})
