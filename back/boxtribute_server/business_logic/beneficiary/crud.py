from ...db import db
from ...enums import TaggableObjectType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ...models.utils import (
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
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
        family_head=family_head_id,
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
        Beneficiary.family_head_id,
        Beneficiary.phone,
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
        beneficiary.family_head = family_head_id
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


class BeneficiariesResult(dict):
    pass


def sanitize_input(data):
    sanitized_data = []
    all_tag_ids = []
    for entry in data:
        if "registered" in entry:
            entry["not_registered"] = not entry["registered"]
        # Remove tag IDs from input because they're inserted into a different table
        tag_ids = set(entry.pop("tag_ids", []))  # remove duplicated IDs
        all_tag_ids.append(tag_ids)
        sanitized_data.append(entry)
    return sanitized_data, all_tag_ids


def create_beneficiaries(
    *,
    user_id,
    base_id,
    beneficiary_data,
):
    """Insert multiple beneficiaries and their tags into the database."""
    sanitized_data, all_tag_ids = sanitize_input(beneficiary_data)
    now = utcnow()
    default_and_common_elements = {
        # defaults
        "last_name": "",
        "date_of_birth": None,
        "gender": None,  # will be converted to '' on DB level
        "is_volunteer": False,
        "not_registered": False,
        # common data
        "base": base_id,
        "created_on": now,
        "created_by": user_id,
    }
    complete_data = [
        {**default_and_common_elements, **beneficiary_entry}
        for beneficiary_entry in sanitized_data
    ]

    first_inserted_id = Beneficiary.insert_many(complete_data).execute()
    beneficiaries = list(
        Beneficiary.select().where(
            Beneficiary.id >= first_inserted_id,
            Beneficiary.id < first_inserted_id + len(complete_data),
        )
    )

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
