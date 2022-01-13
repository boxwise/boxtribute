from ..db import db
from ..enums import (
    BoxState,
    ShipmentState,
    TransferAgreementState,
    TransferAgreementType,
)
from ..exceptions import (
    InvalidShipmentState,
    InvalidTransferAgreementBase,
    InvalidTransferAgreementOrganisation,
    InvalidTransferAgreementState,
)
from ..models.definitions.box import Box
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.shipment import Shipment
from ..models.definitions.shipment_detail import ShipmentDetail
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.utils import utcnow
from .agreement import retrieve_transfer_agreement_bases


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


def create_shipment(*, source_base_id, target_base_id, transfer_agreement_id, user):
    """Insert information for a new Shipment in the database.
    Raise an InvalidTransferAgreementState exception if specified agreement has a state
    different from 'ACCEPTED'.
    Raise an InvalidTransferAgreementBase exception if specified source or target base
    are not included in given agreement.
    Raise an InvalidTransferAgreementOrganisation exception if the current user is not
    member of the agreement source organisation in a unidirectional agreement.
    """
    agreement = TransferAgreement.get_by_id(transfer_agreement_id)
    if agreement.state != TransferAgreementState.Accepted:
        raise InvalidTransferAgreementState(
            expected_states=[TransferAgreementState.Accepted],
            actual_state=agreement.state,
        )

    _validate_bases_as_part_of_transfer_agreement(
        transfer_agreement=agreement,
        source_base_id=source_base_id,
        target_base_id=target_base_id,
    )

    if (agreement.type == TransferAgreementType.Unidirectional) and (
        user["organisation_id"] != agreement.source_organisation_id
    ):
        raise InvalidTransferAgreementOrganisation()

    return Shipment.create(
        source_base=source_base_id,
        target_base=target_base_id,
        transfer_agreement=transfer_agreement_id,
        started_by=user["id"],
    )


def _retrieve_shipment_details(shipment_id, *conditions, model=Box):
    """Retrieve details of shipment with given ID, taking optional conditions for
    selecting, and an additional model to select and join with into account.
    """
    condition = ShipmentDetail.shipment == shipment_id
    for cond in conditions:
        condition &= cond
    return ShipmentDetail.select(ShipmentDetail, model).join(model).where(condition)


def cancel_shipment(*, id, user):
    """Transition state of specified shipment to 'Canceled'.
    Move any boxes marked for shipment back into stock, and soft-delete the
    corresponding shipment details.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    Raise an InvalidTransferAgreementOrganisation exception if the current user is not
    member of either organisation that is part of the underlying transfer agreement.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )
    if user["organisation_id"] not in [
        shipment.transfer_agreement.source_organisation_id,
        shipment.transfer_agreement.target_organisation_id,
    ]:
        raise InvalidTransferAgreementOrganisation()

    now = utcnow()
    shipment.state = ShipmentState.Canceled
    shipment.canceled_by = user["id"]
    shipment.canceled_on = now

    details = []
    for detail in _retrieve_shipment_details(id):
        detail.deleted_by = user["id"]
        detail.deleted_on = now
        detail.box.state = BoxState.InStock
        details.append(detail)

    with db.database.atomic():
        if details:
            Box.bulk_update([d.box for d in details], [Box.state])
            ShipmentDetail.bulk_update(
                details, [ShipmentDetail.deleted_on, ShipmentDetail.deleted_by]
            )
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
        if box.state_id != BoxState.InStock:
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


def _remove_boxes_from_shipment(
    *, shipment_id, user_id, box_label_identifiers, box_state
):
    """With `box_state=InStock`, return boxes to stock; with `box_state=Lost`, mark
    boxes as lost. Soft-delete corresponding shipment details.
    If boxes are requested to be removed that are not contained in the given shipment,
    or have a state different from MarkedForShipment, they are silently discarded.
    """
    box_label_identifiers = box_label_identifiers or []
    if not box_label_identifiers:
        return

    details = []
    for detail in _retrieve_shipment_details(
        shipment_id, (Box.label_identifier << box_label_identifiers)
    ):
        detail.deleted_by = user_id
        detail.deleted_on = utcnow()
        # Logically the box is in state MarkedForShipment since part of a shipment
        detail.box.state = box_state
        details.append(detail)

    if details:
        Box.bulk_update([d.box for d in details], fields=[Box.state])
        ShipmentDetail.bulk_update(
            details, [ShipmentDetail.deleted_on, ShipmentDetail.deleted_by]
        )


def _update_shipment_with_received_boxes(
    *, shipment, user_id, shipment_detail_update_inputs
):
    """Check in all given boxes by updating shipment details (target product and
    location). Transition the corresponding box's state to 'Received'.
    If boxes are requested to be checked-in with a location or a product that is not
    registered in the target base, they are silently discarded.
    """
    # Transform input list into dict for easy look-up
    update_inputs = {
        int(i["id"]): {
            "target_product_id": i["target_product_id"],
            "target_location_id": i["target_location_id"],
        }
        for i in shipment_detail_update_inputs or []
    }

    details = []
    detail_ids = tuple(update_inputs)
    for detail in _retrieve_shipment_details(
        shipment.id, (ShipmentDetail.id << detail_ids), model=Shipment
    ):
        update_input = update_inputs[detail.id]
        target_product_id = update_input["target_product_id"]
        target_location_id = update_input["target_location_id"]

        if not _validate_base_as_part_of_shipment(
            target_location_id, detail=detail, model=Location
        ) or not _validate_base_as_part_of_shipment(
            target_product_id, detail=detail, model=Product
        ):
            continue

        detail.target_product = target_product_id
        detail.target_location = target_location_id
        detail.box.state = BoxState.Received
        details.append(detail)

    if details:
        Box.bulk_update([d.box for d in details], [Box.state])
        ShipmentDetail.bulk_update(
            details, [ShipmentDetail.target_product, ShipmentDetail.target_location]
        )


def _complete_shipment_if_applicable(*, shipment, user_id):
    """If all boxes of the shipment are marked as Received or Lost, transition the
    shipment state to 'Completed', soft-delete the corresponding shipment details,
    assign target product and location to boxes, and transition received boxes to
    'InStock'.
    """
    details = _retrieve_shipment_details(shipment.id)
    if all(d.box.state_id in [BoxState.Received, BoxState.Lost] for d in details):
        now = utcnow()
        shipment.state = ShipmentState.Completed
        shipment.completed_by = user_id
        shipment.completed_on = now
        shipment.save()

        received_boxes = []
        for detail in details:
            detail.deleted_by = user_id
            detail.deleted_on = now
            detail.box.product = detail.target_product
            detail.box.location = detail.target_location
            if detail.box.state_id == BoxState.Received:
                detail.box.state = BoxState.InStock
                received_boxes.append(detail.box)

        Box.bulk_update(received_boxes, [Box.product, Box.location, Box.state])
        ShipmentDetail.bulk_update(
            details, [ShipmentDetail.deleted_on, ShipmentDetail.deleted_by]
        )


def update_shipment(
    *,
    id,
    user,
    prepared_box_label_identifiers=None,
    removed_box_label_identifiers=None,
    received_shipment_detail_update_inputs=None,
    lost_box_label_identifiers=None,
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
    - update checked-in or lost boxes
    - raise InvalidShipmentState exception if shipment state is different from 'Sent'
    - raise an InvalidTransferAgreementOrganisation exception if the current user is not
      member of the organisation that is supposed to receive the shipment
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

    if any([received_shipment_detail_update_inputs, lost_box_label_identifiers]):
        if shipment.state != ShipmentState.Sent:
            raise InvalidShipmentState(
                expected_states=[ShipmentState.Sent], actual_state=shipment.state
            )
        if shipment.target_base.organisation_id != user["organisation_id"]:
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
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user["id"],
            box_label_identifiers=removed_box_label_identifiers,
            box_state=BoxState.InStock,
        )
        _update_shipment_with_received_boxes(
            shipment=shipment,
            shipment_detail_update_inputs=received_shipment_detail_update_inputs,
            user_id=user["id"],
        )
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user["id"],
            box_label_identifiers=lost_box_label_identifiers,
            box_state=BoxState.Lost,
        )
        _complete_shipment_if_applicable(shipment=shipment, user_id=user["id"])

        if target_base_id is not None:
            shipment.target_base = target_base_id
            shipment.save()

    return shipment


def _validate_base_as_part_of_shipment(resource_id, *, detail, model):
    """Validate that the base of the given resource (location or product) is identical
    to the target base of the detail's shipment.
    """
    target_resource = model.get_by_id(resource_id)
    return target_resource.base_id == detail.shipment.target_base_id
