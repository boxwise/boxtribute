"""Create-Retrieve-Update-Delete operations on database models."""
import hashlib
import random
from datetime import datetime, time, timezone

import peewee
from dateutil import tz

from ..db import db
from ..enums import (
    BoxState,
    ShipmentState,
    TransferAgreementState,
    TransferAgreementType,
)
from ..exceptions import (
    BoxCreationFailed,
    InvalidShipmentState,
    InvalidTransferAgreementBase,
    InvalidTransferAgreementOrganisation,
    InvalidTransferAgreementState,
    RequestedResourceNotFound,
)
from .definitions.base import Base
from .definitions.beneficiary import Beneficiary
from .definitions.box import Box
from .definitions.location import Location
from .definitions.product import Product
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
                state=BoxState.InStock,
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
    if data["source_organisation_id"] == data["target_organisation_id"]:
        raise InvalidTransferAgreementOrganisation()

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
    """Transition state of specified transfer agreement to 'Accepted'.
    Raise error if agreement state different from 'UnderReview', or if requesting user
    not a member of the agreement's target_organisation.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    if agreement.target_organisation_id != accepted_by["organisation_id"]:
        raise InvalidTransferAgreementOrganisation()
    agreement.state = TransferAgreementState.Accepted
    agreement.accepted_by = accepted_by["id"]
    agreement.accepted_on = utcnow()
    agreement.save()
    return agreement


def reject_transfer_agreement(*, id, rejected_by):
    """Transition state of specified transfer agreement to 'Rejected'.
    Raise error if agreement state different from 'UnderReview', or if requesting user
    not a member of the agreement's target_organisation.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state != TransferAgreementState.UnderReview:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.UnderReview],
            actual_state=agreement.state,
        )
    if agreement.target_organisation_id != rejected_by["organisation_id"]:
        raise InvalidTransferAgreementOrganisation()
    agreement.state = TransferAgreementState.Rejected
    agreement.terminated_by = rejected_by["id"]
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def cancel_transfer_agreement(*, id, canceled_by):
    """Transition state of specified transfer agreement to 'Canceled'.
    Raise error if agreement state different from 'UnderReview'/'Accepted'.
    """
    agreement = TransferAgreement.get_by_id(id)
    if agreement.state not in [
        TransferAgreementState.UnderReview,
        TransferAgreementState.Accepted,
    ]:
        raise InvalidTransferAgreementState(
            expected_states=[
                TransferAgreementState.UnderReview,
                TransferAgreementState.Accepted,
            ],
            actual_state=agreement.state,
        )
    agreement.state = TransferAgreementState.Canceled
    agreement.terminated_by = canceled_by
    agreement.terminated_on = utcnow()
    agreement.save()
    return agreement


def retrieve_transfer_agreement_bases(*, transfer_agreement, kind):
    """Return all bases (kind: source or target) involved in the given transfer
    agreement. If the selection is None, it indicates that all bases of the respective
    organisation are included.
    """
    return Base.select().join(
        TransferAgreementDetail, on=getattr(TransferAgreementDetail, f"{kind}_base")
    ).where(
        TransferAgreementDetail.transfer_agreement == transfer_agreement.id
    ) or Base.select().where(
        Base.organisation == getattr(transfer_agreement, f"{kind}_organisation")
    )


def _validate_bases_as_part_of_transfer_agreement(
    *, transfer_agreement, source_base_id=None, target_base_id=None
):
    """Validate that given bases are part of the given transfer agreement. Raise
    InvalidTransferAgreementBase exception otherwise.
    """
    for kind in ["source", "target"]:
        base_id = locals()[f"{kind}_base_id"]
        if base_id is None:
            continue

        base_ids = [
            b.id
            for b in retrieve_transfer_agreement_bases(
                transfer_agreement=transfer_agreement, kind=kind
            )
        ]
        if base_id not in base_ids:
            raise InvalidTransferAgreementBase(
                base_id=base_id, expected_base_ids=base_ids
            )


def create_shipment(data, *, started_by):
    """Insert information for a new Shipment in the database.
    Raise an InvalidTransferAgreementState exception if specified agreement has a state
    different from 'ACCEPTED'.
    Raise an InvalidTransferAgreementBase exception if specified source or target base
    are not included in given agreement.
    Raise an InvalidTransferAgreementOrganisation exception if the current user is not
    member of the agreement source organisation in a unidirectional agreement.
    """
    transfer_agreement_id = data.pop("transfer_agreement_id")
    agreement = TransferAgreement.get_by_id(transfer_agreement_id)
    if agreement.state != TransferAgreementState.Accepted:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.Accepted],
            actual_state=agreement.state,
        )

    _validate_bases_as_part_of_transfer_agreement(
        transfer_agreement=agreement,
        source_base_id=data["source_base_id"],
        target_base_id=data["target_base_id"],
    )

    if (agreement.type == TransferAgreementType.Unidirectional) and (
        started_by["organisation_id"] != agreement.source_organisation_id
    ):
        raise InvalidTransferAgreementOrganisation()

    return Shipment.create(
        source_base=data.pop("source_base_id"),
        target_base=data.pop("target_base_id"),
        transfer_agreement=transfer_agreement_id,
        started_by=started_by["id"],
        **data,
    )


def cancel_shipment(*, id, user_id):
    """Transition state of specified shipment to 'Canceled'.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )
    shipment.state = ShipmentState.Canceled
    shipment.canceled_by = user_id
    shipment.canceled_on = utcnow()
    shipment.save()
    return shipment


def send_shipment(*, id, user):
    """Transition state of specified shipment to 'Sent'.
    Raise an InvalidTransferAgreementOrganisation exception if the current user is not
    member of the organisation that originally created the shipment.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.source_base.organisation_id != user["organisation_id"]:
        raise InvalidTransferAgreementOrganisation()
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )
    shipment.state = ShipmentState.Sent
    shipment.sent_by = user["id"]
    shipment.sent_on = utcnow()
    shipment.save()
    return shipment


def _update_shipment_with_prepared_boxes(*, shipment, box_label_identifiers, user_id):
    """Update given shipment with prepared boxes.
    If boxes are requested to be updated that are not located in the shipment's source
    base, or have a state different from InStock, they are silently discarded (i.e. not
    added to the ShipmentDetail model).
    """
    boxes = []
    details = []
    box_label_identifiers = box_label_identifiers or []

    for box in (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier << box_label_identifiers)
    ):
        if box.location.base_id != shipment.source_base_id:
            continue
        if box.state_id != BoxState.InStock.value:
            continue

        box.state = BoxState.MarkedForShipment
        boxes.append(box)
        details.append(
            {
                "shipment": shipment.id,
                "box": box.id,
                "source_product": box.product_id,
                "source_location": box.location_id,
                "created_by": user_id,
            }
        )

    if boxes:
        Box.bulk_update(boxes, fields=[Box.state])
    ShipmentDetail.insert_many(details).execute()


def _update_shipment_with_removed_boxes(*, shipment_id, user_id, box_label_identifiers):
    """Return boxes to stock, and mark corresponding shipment details as deleted.
    If boxes are requested to be removed that are not contained in the given shipment,
    or have a state different from MarkedForShipment, they are silently discarded.
    """
    boxes = []
    box_label_identifiers = box_label_identifiers or []

    for detail in (
        ShipmentDetail.select(Box)
        .join(Box)
        .where(
            (Box.label_identifier << box_label_identifiers)
            & (ShipmentDetail.shipment == shipment_id)
        )
    ):
        # Logically the box is in state MarkedForShipment since part of a shipment
        detail.box.state = BoxState.InStock
        boxes.append(detail.box)
    if boxes:
        Box.bulk_update(boxes, fields=[Box.state])
        ShipmentDetail.update(deleted_by=user_id, deleted_on=utcnow()).where(
            ShipmentDetail.box << boxes
        ).execute()


def _update_shipment_with_received_boxes(
    *, shipment, user, shipment_detail_update_inputs
):
    """Check in all given boxes.
    If all boxes of the shipment are marked as Received, transition the shipment state
    to 'Completed'.
    """
    shipment_detail_update_inputs = shipment_detail_update_inputs or []
    for update_input in shipment_detail_update_inputs:
        update_shipment_detail(user=user, **update_input)
    if all(
        detail.box.state_id == BoxState.Received
        for detail in ShipmentDetail.select(Box)
        .join(Box)
        .where(ShipmentDetail.shipment == shipment.id)
    ):
        shipment.state = ShipmentState.Completed
        shipment.completed_by = user["id"]
        shipment.completed_on = utcnow()
        shipment.save()


def update_shipment(
    *,
    id,
    user,
    prepared_box_label_identifiers=None,
    removed_box_label_identifiers=None,
    received_shipment_detail_update_inputs=None,
    target_base_id=None,
):
    """Update shipment detail information.
    On the shipment source side:
    - update prepared or removed boxes, or target base
    - raise InvalidShipmentState exception if shipment state is different from
      'Preparing'
    - raise an InvalidTransferAgreementOrganisation exception if the current user is not
      member of the organisation that originally created the shipment
    - raise an InvalidTransferAgreementBase exception if specified target base is not
      included in given agreement
    On the shipment target side:
    - update checked-in boxes
    """
    shipment = Shipment.get_by_id(id)
    if any(
        [prepared_box_label_identifiers, removed_box_label_identifiers, target_base_id]
    ):
        if shipment.state != ShipmentState.Preparing:
            raise InvalidShipmentState(
                expected_states=[ShipmentState.Preparing], actual_state=shipment.state
            )
        if shipment.source_base.organisation_id != user["organisation_id"]:
            raise InvalidTransferAgreementOrganisation()

    _validate_bases_as_part_of_transfer_agreement(
        transfer_agreement=TransferAgreement.get_by_id(shipment.transfer_agreement_id),
        target_base_id=target_base_id,
    )

    with db.database.atomic():
        _update_shipment_with_prepared_boxes(
            shipment=shipment,
            user_id=user["id"],
            box_label_identifiers=prepared_box_label_identifiers,
        )
        _update_shipment_with_removed_boxes(
            shipment_id=shipment.id,
            user_id=user["id"],
            box_label_identifiers=removed_box_label_identifiers,
        )
        _update_shipment_with_received_boxes(
            shipment=shipment,
            shipment_detail_update_inputs=received_shipment_detail_update_inputs,
            user=user,
        )

        if target_base_id is not None:
            shipment.target_base = target_base_id
            shipment.save()

    return shipment


def _validate_base_as_part_of_shipment(resource_id, *, detail, model):
    """Validate that the base of the given resource (location or product) is identical
    to the target base of the detail's shipment. Raise InvalidTransferAgreementBase
    exception otherwise.
    """
    if resource_id is not None:
        target_resource = model.get_by_id(resource_id)
        if target_resource.base_id != detail.shipment.target_base_id:
            raise InvalidTransferAgreementBase(
                expected_base_ids=[detail.shipment.target_base_id],
                base_id=target_resource.base_id,
            )


def update_shipment_detail(
    *, id, user, target_product_id=None, target_location_id=None
):
    """Update shipment details (target product and/or location). Transition the
    corresponding box's state to Received.
    Raise an InvalidTransferAgreementOrganisation exception if the current user is not
    member of the organisation that is supposed to receive the shipment.
    Raise InvalidShipmentState exception if shipment state is different from 'Sent'.
    Raise InvalidTransferAgreementBase exception if target location is not in shipment
    target base.
    """
    detail = (
        ShipmentDetail.select(ShipmentDetail, Shipment, Base)
        .join(Shipment)
        .join(Base, on=Shipment.target_base)
        .where(ShipmentDetail.id == id)
        .get()
    )
    if detail.shipment.target_base.organisation_id != user["organisation_id"]:
        raise InvalidTransferAgreementOrganisation()
    if detail.shipment.state != ShipmentState.Sent:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Sent], actual_state=detail.shipment.state
        )

    _validate_base_as_part_of_shipment(
        target_location_id, detail=detail, model=Location
    )
    _validate_base_as_part_of_shipment(target_product_id, detail=detail, model=Product)
    detail.target_product = target_product_id
    detail.target_location = target_location_id
    detail.box.state_id = BoxState.Received
    with db.database.atomic():
        detail.save()
        detail.box.save()
    return detail
