from ...db import db
from ...enums import TaggableObjectType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ...models.utils import (
    save_creation_to_history,
    save_deletion_to_history,
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
):
    """Insert information for a new Beneficiary in the database. Update the
    languages in the corresponding cross-reference table.
    """
    now = utcnow()
    data = dict(
        first_name=first_name,
        last_name=last_name,
        base=base_id,
        group_identifier=group_identifier,
        date_of_birth=date_of_birth,
        gender=gender.value,  # convert to gender abbreviation
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
    **data,
):
    """Look up an existing Beneficiary given an ID, and update all requested fields,
    including the language cross-reference.
    Insert timestamp for modification and return the beneficiary.
    """
    # Handle any items with keys not matching the Model fields
    if gender is not None:
        beneficiary.gender = gender.value

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


@save_deletion_to_history
def deactivate_beneficiary(*, beneficiary):
    beneficiary.deleted = utcnow()
    beneficiary.save()

    if beneficiary.family_head_id is None:
        # Deactivate all children of a parent
        children = Beneficiary.select().where(
            Beneficiary.family_head == beneficiary.id,
            (Beneficiary.deleted.is_null() | ~Beneficiary.deleted),
        )
        with db.database.atomic():
            for child in children:
                deactivate_beneficiary(beneficiary=child)
    return beneficiary


@save_creation_to_history
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
