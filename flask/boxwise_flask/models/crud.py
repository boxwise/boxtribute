"""Create-Retrieve-Update-Delete operations on database models."""
import uuid
from datetime import datetime

from .beneficiary import Beneficiary
from .box import Box
from .qr_code import QRCode


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
    """Insert information for a new Beneficiary in the database."""
    now = datetime.utcnow()

    new_beneficiary = Beneficiary.create(
        base=data.pop("base_id"),
        family_head=data.pop("family_head_id", None),
        not_registered=not data.pop("is_registered"),
        language=data.pop("languages")[0],
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
    return new_beneficiary
