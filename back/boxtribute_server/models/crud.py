"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib
import random
from datetime import datetime, time, timezone

import peewee
from dateutil import tz

from ..db import db
from ..enums import BoxState, TransferAgreementState
from ..exceptions import (
    BoxCreationFailed,
    InvalidTransferAgreement,
    RequestedResourceNotFound,
)
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.qr_code import QrCode
from .definitions.shipment import Shipment
from .definitions.shipment_detail import ShipmentDetail
from .definitions.transfer_agreement import TransferAgreement
from .definitions.transfer_agreement_detail import TransferAgreementDetail
from .definitions.x_beneficiary_language import XBeneficiaryLanguage
from .utils import utcnow

BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS = 10


def create_box(data):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. Generate an 8-digit sequence to identify the
    box. If the sequence is not unique, repeat the generation several times. If
    generation still fails, raise a BoxCreationFailed exception.
    """
    now = utcnow()
    qr_code = data.pop("qr_code", None)
    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    for i in range(BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS):
        try:
            new_box = Box.create(
                label_identifier="".join(random.choices("0123456789", k=8)),
                qr_code=qr_id,
                created_on=now,
                last_modified_on=now,
                last_modified_by=data["created_by"],
                state=BoxState.InStock.value,
                **data,
            )
            return new_box
        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            if "Duplicate entry" not in str(e):
                raise
    raise BoxCreationFailed()


def update_box(data):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    label_identifier = data.pop("label_identifier")
    box = Box.get(Box.label_identifier == label_identifier)

    for field, value in data.items():
        setattr(box, field, value)

    box.last_modified_on = utcnow()
    box.save()
    return box


def create_beneficiary(data):
    """Insert information for a new Beneficiary in the database. Update the
    languages in the corresponding cross-reference table.
    """
    now = utcnow()
    language_ids = data.pop("languages")
    family_head_id = data.pop("family_head_id", None)

    # Set is_signed field depending on signature
    data["is_signed"] = data.get("signature") is not None

    # Convert to gender abbreviation
    gender = data.pop("gender").value

    new_beneficiary = Beneficiary.create(
        base=data.pop("base_id"),
        family_head=family_head_id,
        not_registered=not data.pop("is_registered"),
        gender=gender,
        created_on=now,
        last_modified_on=now,
        last_modified_by=data["created_by"],
        # This is only required for compatibility with legacy DB
        seq=1 if family_head_id is None else 2,
        # These fields are required acc. to model definition
        deleted="0000-00-00 00:00:00",
        family_id=0,
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
    """Look up an existing Beneficiary given an ID, and update all requested fields,
    including the language cross-reference.
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
    beneficiary.seq = 1 if family_head_id is None else 2

    registered = data.pop("is_registered", None)
    if registered is not None:
        beneficiary.not_registered = not registered

    if data.get("signature") is not None:
        beneficiary.is_signed = True

    language_ids = data.pop("languages", [])
    if language_ids:
        XBeneficiaryLanguage.delete().where(
            XBeneficiaryLanguage.beneficiary == beneficiary_id
        ).execute()
        for language_id in language_ids:
            XBeneficiaryLanguage.create(
                language=language_id, beneficiary=beneficiary_id
            )

    for field, value in data.items():
        setattr(beneficiary, field, value)

    beneficiary.last_modified_on = utcnow()
    beneficiary.save()
    return beneficiary


def create_qr_code(data):
    """Insert a new QR code in the database. Generate an MD5 hash based on its primary
    key. If a `box_label_identifier` is passed, look up the corresponding box (it is
    expected to exist) and associate the QR code with it.
    Return the newly created QR code.

    All operations are run inside an atomic transaction. If e.g. the box look-up fails,
    the operations are rolled back (i.e. no new QR code is inserted), and an exception
    is raised.
    """
    box_label_identifier = data.pop("box_label_identifier", None)

    try:
        with db.database.atomic():
            new_qr_code = QrCode.create(created_on=utcnow(), **data)
            new_qr_code.code = hashlib.md5(str(new_qr_code.id).encode()).hexdigest()
            new_qr_code.save()

            if box_label_identifier is not None:
                box = Box.get(Box.label_identifier == box_label_identifier)
                box.qr_code = new_qr_code.id
                box.save()

        return new_qr_code

    except peewee.DoesNotExist:
        raise RequestedResourceNotFound()


def create_transfer_agreement(data):
    """Insert information for a new TransferAgreement in the database. Update
    TransferAgreementDetail model with given source/target base information. By default,
    the agreement is established between all bases of both organisations (indicated by
    NULL for the Detail.source/target_base field).
    Convert optional local dates into UTC datetimes using timezone information.
    """
    if "valid_from" in data and data["valid_from"] is None:
        # GraphQL input had 'validFrom: null', use default defined in model instead
        del data["valid_from"]

    with db.database.atomic():
        # In GraphQL input, base IDs can be omitted, or explicitly be null.
        # Avoid duplicate base IDs by creating sets
        source_base_ids = set(data.pop("source_base_ids", None) or [None])
        target_base_ids = set(data.pop("target_base_ids", None) or [None])

        valid_from = data.get("valid_from")
        valid_until = data.get("valid_until")
        if valid_from is not None or valid_until is not None:
            tzinfo = tz.gettz(data.pop("timezone"))
            # Insert time information such that start/end is at midnight
            if valid_from is not None:
                data["valid_from"] = datetime.combine(
                    valid_from, time(), tzinfo=tzinfo
                ).astimezone(timezone.utc)
            if valid_until is not None:
                data["valid_until"] = datetime.combine(
                    valid_until, time(23, 59, 59), tzinfo=tzinfo
                ).astimezone(timezone.utc)

        transfer_agreement = TransferAgreement.create(
            source_organisation=data.pop("source_organisation_id"),
            target_organisation=data.pop("target_organisation_id"),
            **data,
        )

        # Build all combinations of source and target bases under current agreement
        details_data = [
            {
                "source_base": s,
                "target_base": t,
                "transfer_agreement": transfer_agreement.id,
            }
            for s in source_base_ids
            for t in target_base_ids
        ]
        TransferAgreementDetail.insert_many(details_data).execute()
        return transfer_agreement


def accept_transfer_agreement(*, id, accepted_by):
    """Transition state of specified transfer agreement to 'Accepted'."""
    agreement = TransferAgreement.get_by_id(id)
    agreement.state = TransferAgreementState.Accepted.value
    agreement.accepted_by = accepted_by
    agreement.accepted_on = utcnow()
    agreement.save()
    return agreement


def terminate_transfer_agreement(*, id, terminated_by, reason):
    """Transition state of specified transfer agreement to state matching the given
    reason (a TransferAgreementState enum value: Rejected or Canceled).
    """
    agreement = TransferAgreement.get_by_id(id)
    agreement.state = reason.value
    agreement.terminated_by = terminated_by
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def create_shipment(data):
    """Insert information for a new Shipment in the database. Raise a
    InvalidTransferAgreement exception if specified agreement has a state different from
    'ACCEPTED'.
    """
    transfer_agreement_id = data.pop("transfer_agreement_id")
    agreement = TransferAgreement.get_by_id(transfer_agreement_id)
    if agreement.state != TransferAgreementState.Accepted.value:
        raise InvalidTransferAgreement()

    return Shipment.create(
        source_base=data.pop("source_base_id"),
        target_base=data.pop("target_base_id"),
        transfer_agreement=transfer_agreement_id,
        **data,
    )


def update_shipment(data):
    """Update shipment detail information, such as prepared boxes."""
    prepared_box_label_identifiers = data.pop("prepared_box_label_identifiers", [])
    shipment_id = data.pop("id")
    details = []

    with db.database.atomic():
        boxes = []
        for box in Box.select().where(
            Box.label_identifier.in_(prepared_box_label_identifiers)
        ):
            box.state = BoxState.MarkedForShipment.value
            boxes.append(box)
            details.append(
                {
                    "shipment": shipment_id,
                    "box": box.id,
                    "source_product": box.product_id,
                    "source_location": box.location_id,
                    **data,
                }
            )

        Box.bulk_update(boxes, fields=[Box.state])
        ShipmentDetail.insert_many(details).execute()
    return Shipment.get_by_id(shipment_id)
