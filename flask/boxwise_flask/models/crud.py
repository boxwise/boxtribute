"""Create-Retrieve-Update-Delete operations on database models."""
import uuid
from datetime import datetime

from .beneficiary import Beneficiary
from .box import Box
from .qr_code import QRCode
from .x_beneficiary_language import XBeneficiaryLanguage


def create_box(data):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. Generate a UUID to identify the box.
    """
    now = datetime.utcnow()
    qr_code = data.pop("qr_code", None)
    qr_id = QRCode.get_id_from_code(qr_code) if qr_code is not None else None

    new_box = Box.create(
        box_label_identifier=str(uuid.uuid4())[: Box.box_label_identifier.max_length],
        qr_id=qr_id,
        created_on=now,
        last_modified_on=now,
        last_modified_by=data["created_by"],
        box_state=1,
        **data,
    )
    return new_box


def update_box(data):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box_id = data.pop("box_label_identifier")
    box = Box.get_box(box_id)

    for field, value in data.items():
        setattr(box, field, value)

    box.last_modified_on = datetime.utcnow()
    box.save()
    return box


def create_beneficiary(data):
    """Insert information for a new Beneficiary in the database. Update the
    languages in the corresponding cross-reference table.
    """
    now = datetime.utcnow()
    language_ids = data.pop("languages")

    # Set is_signed field depending on signature
    data["is_signed"] = data.get("signature") is not None

    new_beneficiary = Beneficiary.create(
        base=data.pop("base_id"),
        family_head=data.pop("family_head_id", None),
        not_registered=not data.pop("is_registered"),
        created_on=now,
        last_modified_on=now,
        last_modified_by=data["created_by"],
        # These fields are required acc. to model definition
        deleted="0000-00-00 00:00:00",
        family_id=0,
        seq=0,
        bicycle_ban_comment="",
        workshop_ban_comment="",
        **data,
    )
    for language_id in language_ids:
        XBeneficiaryLanguage.create(
            language=language_id, beneficiary=new_beneficiary.id
        )
    return new_beneficiary


def update_beneficiary(data):
    """Look up an existing Beneficiary given an ID, and update all requested fields.
    Insert timestamp for modification and return the beneficiary.
    """
    beneficiary_id = data.pop("id")
    beneficiary = Beneficiary.get_by_id(beneficiary_id)

    # Handle any items with keys not matching the Model fields by popping off
    base_id = data.pop("base_id", None)
    if base_id is not None:
        beneficiary.base = base_id

    family_head_id = data.pop("family_head_id", None)
    if family_head_id is not None:
        beneficiary.family_head = family_head_id

    registered = data.pop("is_registered", None)
    if registered is not None:
        beneficiary.not_registered = not registered

    if data.get("signature") is not None:
        beneficiary.is_signed = True

    for field, value in data.items():
        setattr(beneficiary, field, value)

    beneficiary.last_modified_on = datetime.utcnow()
    beneficiary.save()
    return beneficiary
