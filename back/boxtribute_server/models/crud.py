"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib
import random

import peewee

from ..db import db
from ..enums import BoxState
from ..exceptions import BoxCreationFailed, RequestedResourceNotFound
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.location import Location
from .definitions.qr_code import QrCode
from .definitions.x_beneficiary_language import XBeneficiaryLanguage
from .utils import utcnow

BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS = 10


def create_box(
    product_id,
    location_id,
    user_id,
    size_id,
    comment="",
    items=0,
    qr_code=None,
):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. If a location with a box state is passed
    use its box state for the new box. Generate an 8-digit sequence to identify the
    box. If the sequence is not unique, repeat the generation several times. If
    generation still fails, raise a BoxCreationFailed exception.
    """

    now = utcnow()
    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    location_box_state = Location.get_by_id(location_id).box_state
    box_state = BoxState.InStock if location_box_state is None else location_box_state
    for i in range(BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS):
        try:
            new_box = Box.create(
                comment=comment,
                created_on=now,
                created_by=user_id,
                items=items,
                label_identifier="".join(random.choices("0123456789", k=8)),
                last_modified_on=now,
                last_modified_by=user_id,
                location=location_id,
                product=product_id,
                size=size_id,
                state=box_state,
                qr_code=qr_id,
            )
            return new_box
        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            if "Duplicate entry" not in str(e):
                raise
    raise BoxCreationFailed()


def update_box(
    label_identifier,
    user_id,
    comment=None,
    items=None,
    location_id=None,
    product_id=None,
    size_id=None,
):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box = Box.get(Box.label_identifier == label_identifier)

    if comment is not None:
        box.comment = comment
    if items is not None:
        box.items = items
    if location_id is not None:
        box.location = location_id
        location_box_state = Location.get(Location.id == location_id).box_state
        box.state = location_box_state if location_box_state is not None else box.state
    if product_id is not None:
        box.product = product_id
    if size_id is not None:
        box.size = size_id

    box.last_modified_by = user_id
    box.last_modified_on = utcnow()
    box.save()
    return box


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
    new_beneficiary = Beneficiary.create(
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
        created_by=user["id"],
        last_modified_on=now,
        last_modified_by=user["id"],
        # This is only required for compatibility with legacy DB
        seq=1 if family_head_id is None else 2,
        # These fields are required acc. to model definition
        family_id=0,
        bicycle_ban_comment="",
        workshop_ban_comment="",
    )

    language_ids = languages or []
    XBeneficiaryLanguage.insert_many(
        [{"language": lid, "beneficiary": new_beneficiary.id} for lid in language_ids]
    ).execute()

    return new_beneficiary


def update_beneficiary(
    *,
    user,
    id,
    base_id=None,
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
    if base_id is not None:
        beneficiary.base = base_id

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
    beneficiary.last_modified_by = user["id"]

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


def create_qr_code(box_label_identifier=None):
    """Insert a new QR code in the database. Generate an MD5 hash based on its primary
    key. If a `box_label_identifier` is passed, look up the corresponding box (it is
    expected to exist) and associate the QR code with it.
    Return the newly created QR code.

    All operations are run inside an atomic transaction. If e.g. the box look-up fails,
    the operations are rolled back (i.e. no new QR code is inserted), and an exception
    is raised.
    """
    try:
        with db.database.atomic():
            new_qr_code = QrCode.create(created_on=utcnow())
            new_qr_code.code = hashlib.md5(str(new_qr_code.id).encode()).hexdigest()
            new_qr_code.save()

            if box_label_identifier is not None:
                box = Box.get(Box.label_identifier == box_label_identifier)
                box.qr_code = new_qr_code.id
                box.save()

        return new_qr_code

    except peewee.DoesNotExist:
        raise RequestedResourceNotFound()
