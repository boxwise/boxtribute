from ..db import db
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.x_beneficiary_language import XBeneficiaryLanguage
from ..models.utils import utcnow


def create_beneficiary(
    *,
    user,
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
        created_by=user.id,
        last_modified_on=now,
        last_modified_by=user.id,
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
    new_beneficiary = Beneficiary.create(**data)

    language_ids = languages or []
    XBeneficiaryLanguage.insert_many(
        [{"language": lid, "beneficiary": new_beneficiary.id} for lid in language_ids]
    ).execute()

    return new_beneficiary


def update_beneficiary(
    *,
    user,
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
    beneficiary = Beneficiary.get_by_id(id)

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

    beneficiary.last_modified_on = utcnow()
    beneficiary.last_modified_by = user.id

    with db.database.atomic():
        language_ids = languages or []
        if language_ids:
            XBeneficiaryLanguage.delete().where(
                XBeneficiaryLanguage.beneficiary == id
            ).execute()
            XBeneficiaryLanguage.insert_many(
                [{"language": lid, "beneficiary": id} for lid in language_ids]
            ).execute()
        beneficiary.save()

    return beneficiary
