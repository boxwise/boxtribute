from ....db import db
from ....enums import (
    BoxState,
    ShipmentState,
    TaggableObjectType,
    TransferAgreementState,
    TransferAgreementType,
)
from ....exceptions import (
    InvalidShipmentState,
    InvalidTransferAgreementBase,
    InvalidTransferAgreementState,
)
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.shipment import Shipment
from ....models.definitions.shipment_detail import ShipmentDetail
from ....models.definitions.tags_relation import TagsRelation
from ....models.definitions.transfer_agreement import TransferAgreement
from ....models.utils import utcnow
from ..agreement.crud import retrieve_transfer_agreement_bases


# TODO: consider to introduce validation checks
# to all places where locations are used
# to ensure they are only about classic locations
def _validate_bases_as_part_of_transfer_agreement(
    *, transfer_agreement, source_base_id=None, target_base_id=None
):
    """Validate that given bases are part of the given transfer agreement. Raise
    InvalidTransferAgreementBase exception otherwise.
    """
    base_ids = {}
    kinds = ["source", "target"]
    for kind in kinds:
        base_ids[kind] = [
            b.id
            for b in retrieve_transfer_agreement_bases(
                agreement=transfer_agreement, kind=kind
            )
        ]

    all_base_ids = base_ids["source"] + base_ids["target"]
    for kind in kinds:
        base_id = locals()[f"{kind}_base_id"]
        if base_id is None:
            continue

        if transfer_agreement.type == TransferAgreementType.Bidirectional:
            # Any base included in the agreement can be source or target of a shipment
            relevant_base_ids = all_base_ids
        else:
            relevant_base_ids = base_ids[kind]
        if base_id not in relevant_base_ids:
            raise InvalidTransferAgreementBase(
                base_id=base_id, expected_base_ids=base_ids
            )


def create_shipment(*, source_base_id, target_base_id, transfer_agreement_id, user):
    """Insert information for a new Shipment in the database.
    Raise an InvalidTransferAgreementState exception if specified agreement has a state
    different from 'Accepted'.
    Raise an InvalidTransferAgreementBase exception if specified source or target base
    are not included in given agreement.
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

    return Shipment.create(
        source_base=source_base_id,
        target_base=target_base_id,
        transfer_agreement=transfer_agreement_id,
        started_by=user.id,
    )


def _retrieve_shipment_details(shipment_id, *conditions, model=Box):
    """Retrieve details of shipment with given ID, taking optional conditions for
    selecting, and an additional model to select and join with into account.
    """
    return (
        ShipmentDetail.select(ShipmentDetail, model)
        .join(model)
        .where(ShipmentDetail.shipment == shipment_id, *conditions)
    )


def cancel_shipment(*, id, user):
    """Transition state of specified shipment to 'Canceled'.
    Move any boxes marked for shipment back into stock, and soft-delete the
    corresponding shipment details by setting the removed_on/by fields.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )

    now = utcnow()
    shipment.state = ShipmentState.Canceled
    shipment.canceled_by = user.id
    shipment.canceled_on = now

    details = []
    for detail in _retrieve_shipment_details(id):
        detail.removed_by = user.id
        detail.removed_on = now
        detail.box.state = BoxState.InStock
        details.append(detail)

    with db.database.atomic():
        if details:
            Box.bulk_update([d.box for d in details], [Box.state])
            ShipmentDetail.bulk_update(
                details, [ShipmentDetail.removed_on, ShipmentDetail.removed_by]
            )
        shipment.save()
    return shipment


def send_shipment(*, id, user):
    """Transition state of specified shipment to 'Sent'.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )
    shipment.state = ShipmentState.Sent
    shipment.sent_by = user.id
    shipment.sent_on = utcnow()
    shipment.save()
    return shipment


def start_receiving_shipment(*, id, user):
    """Transition state of specified shipment to 'Receiving'.
    Transition states of all contained MarkedForShipment boxes to 'Receiving'.
    Raise InvalidShipmentState exception if shipment state is different from 'Sent'.
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Sent:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Sent], actual_state=shipment.state
        )
    shipment.state = ShipmentState.Receiving
    shipment.receiving_started_by = user.id
    shipment.receiving_started_on = utcnow()

    boxes = [
        detail.box
        for detail in _retrieve_shipment_details(
            id, Box.state == BoxState.MarkedForShipment
        )
    ]
    for box in boxes:
        box.state = BoxState.Receiving

    with db.database.atomic():
        shipment.save()
        if boxes:
            Box.bulk_update(boxes, fields=[Box.state])
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
                "source_size": box.size_id,
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

    now = utcnow()
    details = []
    for detail in _retrieve_shipment_details(
        shipment_id, (Box.label_identifier << box_label_identifiers)
    ):
        if box_state == BoxState.InStock:
            detail.removed_on = now
            detail.removed_by = user_id
            fields = [ShipmentDetail.removed_on, ShipmentDetail.removed_by]
        elif box_state == BoxState.Lost:
            detail.lost_on = now
            detail.lost_by = user_id
            fields = [ShipmentDetail.lost_on, ShipmentDetail.lost_by]

        # Logically the box is in state MarkedForShipment since part of a shipment
        detail.box.state = box_state
        details.append(detail)

    if details:
        Box.bulk_update([d.box for d in details], fields=[Box.state])
        ShipmentDetail.bulk_update(details, fields=fields)


def _update_shipment_with_received_boxes(
    *, shipment, user_id, shipment_detail_update_inputs
):
    """Move boxes from the shipment into stock of the target base.
    Update shipment details (target product, size and location). Transition the
    corresponding box's state to 'InStock' and assign target product, size and location.
    Remove all assigned tags from received boxes.
    If boxes are requested to be checked-in with a location or a product that is not
    registered in the target base, or with a state other than 'Receiving', they are
    silently discarded.
    """
    # Transform input list into dict for easy look-up
    update_inputs = {
        int(i["id"]): {
            "target_product_id": i["target_product_id"],
            "target_location_id": i["target_location_id"],
            "target_size_id": i["target_size_id"],
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
        target_size_id = update_input["target_size_id"]

        if (
            not _validate_base_as_part_of_shipment(
                target_location_id, detail=detail, model=Location
            )
            or not _validate_base_as_part_of_shipment(
                target_product_id, detail=detail, model=Product
            )
            or detail.box.state_id != BoxState.Receiving
        ):
            continue

        detail.target_product = target_product_id
        detail.target_location = target_location_id
        detail.target_size = target_size_id
        detail.box.product = target_product_id
        detail.box.location = target_location_id
        detail.box.size = target_size_id
        detail.box.state = BoxState.InStock
        details.append(detail)

    if details:
        checked_in_boxes = [d.box for d in details]
        Box.bulk_update(
            checked_in_boxes, [Box.state, Box.product, Box.location, Box.size]
        )
        ShipmentDetail.bulk_update(
            details,
            [
                ShipmentDetail.target_product,
                ShipmentDetail.target_location,
                ShipmentDetail.target_size,
            ],
        )
        TagsRelation.delete().where(
            (TagsRelation.object_type == TaggableObjectType.Box),
            TagsRelation.object_id << [box.id for box in checked_in_boxes],
        ).execute()


def _complete_shipment_if_applicable(*, shipment, user_id):
    """If all boxes of the shipment that were being sent
    - are marked as Lost, transition the shipment state to 'Lost',
    - are marked as InStock or Lost, transition the shipment state to 'Completed', and
    soft-delete the corresponding shipment details by setting the received_on/by fields.
    """
    details = _retrieve_shipment_details(
        shipment.id,
        ShipmentDetail.removed_on.is_null(),
    )
    now = utcnow()

    if all(d.box.state_id == BoxState.Lost for d in details):
        shipment.state = ShipmentState.Lost
        shipment.completed_by = user_id
        shipment.completed_on = now
        shipment.save()

    elif all(d.box.state_id in [BoxState.InStock, BoxState.Lost] for d in details):
        shipment.state = ShipmentState.Completed
        shipment.completed_by = user_id
        shipment.completed_on = now
        shipment.save()

        for detail in details:
            if detail.box.state_id == BoxState.Lost:
                # Lost boxes must not be marked as received
                continue
            detail.received_by = user_id
            detail.received_on = now

        ShipmentDetail.bulk_update(
            details, [ShipmentDetail.received_on, ShipmentDetail.received_by]
        )


def update_shipment_when_preparing(
    *,
    id,
    user,
    prepared_box_label_identifiers=None,
    removed_box_label_identifiers=None,
    target_base_id=None,
):
    """Update shipment detail information during preparation (on shipment source side).
    - update prepared or removed boxes, or target base
    - raise InvalidShipmentState exception if shipment state is different from
      'Preparing'
    - raise an InvalidTransferAgreementBase exception if specified target base is not
      included in given agreement
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )

    _validate_bases_as_part_of_transfer_agreement(
        transfer_agreement=TransferAgreement.get_by_id(shipment.transfer_agreement_id),
        target_base_id=target_base_id,
    )

    with db.database.atomic():
        _update_shipment_with_prepared_boxes(
            shipment=shipment,
            user_id=user.id,
            box_label_identifiers=prepared_box_label_identifiers,
        )
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user.id,
            box_label_identifiers=removed_box_label_identifiers,
            box_state=BoxState.InStock,
        )

        if target_base_id is not None:
            shipment.target_base = target_base_id
            shipment.save()

    return shipment


def update_shipment_when_receiving(
    *,
    id,
    user,
    received_shipment_detail_update_inputs=None,
    lost_box_label_identifiers=None,
):
    """Update shipment detail information during reception (on shipment target side).
    - update checked-in or lost boxes
    - raise InvalidShipmentState exception if shipment state is different from
      'Receiving'
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Receiving:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Receiving], actual_state=shipment.state
        )

    with db.database.atomic():
        _update_shipment_with_received_boxes(
            shipment=shipment,
            shipment_detail_update_inputs=received_shipment_detail_update_inputs,
            user_id=user.id,
        )
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user.id,
            box_label_identifiers=lost_box_label_identifiers,
            box_state=BoxState.Lost,
        )
        _complete_shipment_if_applicable(shipment=shipment, user_id=user.id)

    return shipment


def _validate_base_as_part_of_shipment(resource_id, *, detail, model):
    """Validate that the base of the given resource (location or product) is identical
    to the target base of the detail's shipment.
    Return false if resource does not exist.
    """
    try:
        target_resource = model.get_by_id(resource_id)
        return target_resource.base_id == detail.shipment.target_base_id
    except model.DoesNotExist:
        return False


def mark_shipment_as_lost(*, id, user):
    """Change shipment state to 'Lost'. Update states of all contained
    'MarkedForShipment' boxes to 'Lost' and soft-delete all shipment details by setting
    the lost_on/by fields.
    - raise InvalidShipmentState exception if shipment state is different from 'Sent'
    """
    shipment = Shipment.get_by_id(id)
    if shipment.state != ShipmentState.Sent:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Sent], actual_state=shipment.state
        )

    with db.database.atomic():
        shipment.state = ShipmentState.Lost
        shipment.completed_on = utcnow()
        shipment.completed_by = user.id
        box_label_identifiers = [
            d.box.label_identifier
            for d in _retrieve_shipment_details(
                id, Box.state == BoxState.MarkedForShipment
            )
        ]
        _remove_boxes_from_shipment(
            shipment_id=id,
            user_id=user.id,
            box_label_identifiers=box_label_identifiers,
            box_state=BoxState.Lost,
        )
        shipment.save()
    return shipment
