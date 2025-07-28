from ....authz import authorize
from ....db import db
from ....enums import (
    BoxState,
    ShipmentState,
    TaggableObjectType,
    TransferAgreementState,
    TransferAgreementType,
)
from ....exceptions import (
    IdenticalShipmentSourceAndTargetBase,
    InvalidShipmentDetailUpdateInput,
    InvalidShipmentState,
    InvalidTransferAgreementBase,
    InvalidTransferAgreementState,
    ShipmentSourceAndTargetBaseOrganisationsMismatch,
)
from ....models.definitions.base import Base
from ....models.definitions.box import Box
from ....models.definitions.box_state import BoxState as BoxStateModel
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.shipment import Shipment
from ....models.definitions.shipment_detail import ShipmentDetail
from ....models.definitions.tags_relation import TagsRelation
from ....models.definitions.transfer_agreement import TransferAgreement
from ....models.utils import BATCH_SIZE, create_history_entries, utcnow
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


def create_shipment(
    *, source_base_id, target_base_id, user, transfer_agreement_id=None
):
    """Insert information for a new Shipment in the database.
    If no transfer agreement is specified, an intra-org shipment will be created.

    Validations for intra-org shipment:
    - Raise an IdenticalShipmentSourceAndTargetBase exception if source and target base
      are identical
    - Raise a ShipmentSourceAndTargetBaseOrganisationsMismatch exception if source and
      target base belong to different organisations

    Validations for inter-org shipment:
    - Raise an InvalidTransferAgreementState exception if specified agreement has a
      state different from 'Accepted'.
    - Raise an InvalidTransferAgreementBase exception if specified source or target base
      are not included in given agreement.
    """
    if transfer_agreement_id is None:
        if source_base_id == target_base_id:
            raise IdenticalShipmentSourceAndTargetBase()

        source_base_organisation_id = (
            Base.select(Base.organisation).where(Base.id == source_base_id).scalar()
        )
        target_base_organisation_id = (
            Base.select(Base.organisation).where(Base.id == target_base_id).scalar()
        )
        if source_base_organisation_id != target_base_organisation_id:
            raise ShipmentSourceAndTargetBaseOrganisationsMismatch()

    else:
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


def _bulk_update_box_state(*, boxes, state, user_id, now):
    """Update state of given boxes, and track these changes in the history table.
    Also update last_modified_on and last_modified_by fields.
    Must be placed inside a `with db.database.atomic()` context.
    """
    if not boxes:
        return

    history_entries = []
    for box in boxes:
        history_entries.extend(
            create_history_entries(
                old_resource=box,
                # Create a dummy box objects as new resource (won't be saved)
                new_resource=Box(id=box.id, state=state),
                fields=[Box.state],
                change_date=now,
            )
        )
        box.state = state
        box.last_modified_on = now
        box.last_modified_by = user_id
    Box.bulk_update(
        boxes,
        [Box.state, Box.last_modified_on, Box.last_modified_by],
        batch_size=BATCH_SIZE,
    )
    DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)


def cancel_shipment(*, shipment, user):
    """Transition state of specified shipment to 'Canceled'.
    Move any boxes marked for shipment back into stock, and soft-delete the
    corresponding shipment details by setting the removed_on/by fields.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )

    now = utcnow()
    shipment.state = ShipmentState.Canceled
    shipment.canceled_by = user.id
    shipment.canceled_on = now

    # Only remove details that have not been removed yet
    details = _retrieve_shipment_details(
        shipment.id,
        ShipmentDetail.removed_on.is_null(),
    )
    for detail in details:
        detail.removed_by = user.id
        detail.removed_on = now

    with db.database.atomic():
        _bulk_update_box_state(
            boxes=[d.box for d in details],
            state=BoxState.InStock,
            user_id=user.id,
            now=now,
        )
        if details:
            ShipmentDetail.bulk_update(
                details,
                [ShipmentDetail.removed_on, ShipmentDetail.removed_by],
                batch_size=BATCH_SIZE,
            )
        shipment.save(only=[Shipment.state, Shipment.canceled_by, Shipment.canceled_on])
    return shipment


def send_shipment(*, shipment, user):
    """Transition state of specified shipment to 'Sent'.
    Transition states of all contained MarkedForShipment boxes to 'InTransit'.
    Raise InvalidShipmentState exception if shipment state is different from
    'Preparing'.
    """
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )
    now = utcnow()
    shipment.state = ShipmentState.Sent
    shipment.sent_by = user.id
    shipment.sent_on = now

    boxes = [
        detail.box
        for detail in _retrieve_shipment_details(
            shipment.id,
            Box.state == BoxState.MarkedForShipment,
            ShipmentDetail.removed_on.is_null(),
        )
    ]

    with db.database.atomic():
        shipment.save(only=[Shipment.state, Shipment.sent_by, Shipment.sent_on])
        _bulk_update_box_state(
            boxes=boxes, state=BoxState.InTransit, user_id=user.id, now=now
        )
    return shipment


def start_receiving_shipment(*, shipment, user):
    """Transition state of specified shipment to 'Receiving'.
    Transition states of all contained InTransit boxes to 'Receiving'.
    Raise InvalidShipmentState exception if shipment state is different from 'Sent'.
    """
    if shipment.state != ShipmentState.Sent:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Sent], actual_state=shipment.state
        )
    now = utcnow()
    shipment.state = ShipmentState.Receiving
    shipment.receiving_started_by = user.id
    shipment.receiving_started_on = now

    boxes = [
        detail.box
        for detail in _retrieve_shipment_details(
            shipment.id,
            Box.state == BoxState.InTransit,
            ShipmentDetail.removed_on.is_null(),
        )
    ]

    with db.database.atomic():
        shipment.save(
            only=[
                Shipment.state,
                Shipment.receiving_started_by,
                Shipment.receiving_started_on,
            ]
        )
        _bulk_update_box_state(
            boxes=boxes, state=BoxState.Receiving, user_id=user.id, now=now
        )
    return shipment


def _update_shipment_with_prepared_boxes(
    *, shipment, box_label_identifiers, user_id, now
):
    """Update given shipment with prepared boxes.
    If boxes are requested to be updated that are not located in the shipment's source
    base, or have a state different from InStock, they are silently discarded (i.e. not
    added to the ShipmentDetail model).
    """
    if not box_label_identifiers:
        return

    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .where(
            Box.label_identifier << box_label_identifiers,
            Box.state == BoxState.InStock,
            Location.base_id == shipment.source_base,
        )
    )
    details = [
        ShipmentDetail(
            shipment=shipment.id,
            box=box.id,
            source_product=box.product_id,
            source_location=box.location_id,
            source_size=box.size_id,
            source_quantity=box.number_of_items,
            created_by=user_id,
        )
        for box in boxes
    ]

    _bulk_update_box_state(
        boxes=boxes, state=BoxState.MarkedForShipment, user_id=user_id, now=now
    )
    ShipmentDetail.bulk_create(details, batch_size=BATCH_SIZE)


def _remove_boxes_from_shipment(
    *, shipment_id, user_id, box_label_identifiers, box_state, now
):
    """With `box_state=InStock`, return boxes to stock; with `box_state=NotDelivered`,
    mark boxes as lost during shipment. Soft-delete corresponding shipment details.
    If boxes are requested to be removed that are not contained in the given shipment,
    or in an invalid state for the operation (e.g. only MarkedForShipment boxes can be
    moved back to InStock during shipment preparation), they are silently discarded.
    """
    box_label_identifiers = box_label_identifiers or []
    if not box_label_identifiers:
        return
    if box_state not in [BoxState.InStock, BoxState.NotDelivered]:  # pragma: no cover
        raise ValueError("Function used with invalid box state")

    if box_state == BoxState.InStock:
        fields = [ShipmentDetail.removed_on, ShipmentDetail.removed_by]
        old_box_states = [BoxState.MarkedForShipment]
    else:
        fields = [ShipmentDetail.lost_on, ShipmentDetail.lost_by]
        old_box_states = [BoxState.InTransit, BoxState.Receiving]

    details = []
    for detail in _retrieve_shipment_details(
        shipment_id,
        (Box.label_identifier << box_label_identifiers),
        Box.state << old_box_states,
    ):
        setattr(detail, fields[0].name, now)
        setattr(detail, fields[1].name, user_id)
        details.append(detail)

    if details:
        _bulk_update_box_state(
            boxes=[d.box for d in details], state=box_state, user_id=user_id, now=now
        )
        ShipmentDetail.bulk_update(details, fields=fields, batch_size=BATCH_SIZE)


def _update_shipment_with_received_boxes(
    *, shipment, user_id, shipment_detail_update_inputs, now
):
    """Move boxes from the shipment into stock of the target base.
    Update shipment details (target product, size and location). Transition the
    corresponding box's state to 'InStock' and assign target product, size and location.
    Remove all assigned tags from received boxes.
    If boxes are requested to be checked-in with a location or a product that is not
    registered in the target base, or with a state other than 'Receiving', an
    InvalidShipmentDetailUpdateInput exception is raised.
    """
    if not shipment_detail_update_inputs:
        return

    # Transform input list into dict for easy look-up
    update_inputs = {
        int(i["id"]): {
            "target_product_id": i["target_product_id"],
            "target_location_id": i["target_location_id"],
            "target_size_id": i["target_size_id"],
            "target_quantity": i["target_quantity"],
        }
        for i in shipment_detail_update_inputs
    }
    detail_ids = tuple(update_inputs)

    # Input validation
    existing_details = _retrieve_shipment_details(
        shipment.id, (ShipmentDetail.id << detail_ids), model=Shipment
    )
    for detail in existing_details:
        update_input = update_inputs[detail.id]
        _validate_base_as_part_of_shipment(
            update_input["target_location_id"], detail=detail, model=Location
        )
        _validate_base_as_part_of_shipment(
            update_input["target_product_id"], detail=detail, model=Product
        )
        if detail.box.state_id != BoxState.Receiving:
            raise InvalidShipmentDetailUpdateInput(model=BoxStateModel, detail=detail)

    updated_box_fields = [
        Box.product,
        Box.location,
        Box.size,
        Box.number_of_items,
        Box.state,
    ]
    details = []
    history_entries = []
    for detail in existing_details:
        update_input = update_inputs[detail.id]
        target_product_id = update_input["target_product_id"]
        target_location_id = update_input["target_location_id"]
        target_size_id = update_input["target_size_id"]
        target_quantity = update_input["target_quantity"]

        detail.target_product = target_product_id
        detail.target_location = target_location_id
        detail.target_size = target_size_id
        detail.target_quantity = target_quantity
        detail.received_on = now
        detail.received_by = user_id
        detail.box.product = target_product_id
        detail.box.location = target_location_id
        detail.box.size = target_size_id
        detail.box.number_of_items = target_quantity
        detail.box.state = BoxState.InStock
        details.append(detail)
        history_entries.extend(
            create_history_entries(
                # Create a dummy box objects as old resource (won't be saved)
                old_resource=Box(
                    product=detail.source_product_id,
                    location=detail.source_location_id,
                    size=detail.source_size_id,
                    number_of_items=detail.source_quantity,
                    state=BoxState.Receiving,
                ),
                new_resource=detail.box,
                fields=updated_box_fields,
                change_date=now,
            )
        )

    if details:
        checked_in_boxes = [d.box for d in details]
        Box.bulk_update(
            checked_in_boxes,
            [Box.state, Box.product, Box.location, Box.size, Box.number_of_items],
            batch_size=BATCH_SIZE,
        )
        ShipmentDetail.bulk_update(
            details,
            [
                ShipmentDetail.target_product,
                ShipmentDetail.target_location,
                ShipmentDetail.target_size,
                ShipmentDetail.target_quantity,
                ShipmentDetail.received_on,
                ShipmentDetail.received_by,
            ],
            batch_size=BATCH_SIZE,
        )
        TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
            TagsRelation.object_type == TaggableObjectType.Box,
            TagsRelation.object_id << [box.id for box in checked_in_boxes],
            TagsRelation.deleted_on.is_null(),
        ).execute()
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)


def _complete_shipment_if_applicable(*, shipment, user_id, now):
    """If all boxes of the shipment that were being sent
    - are marked as NotDelivered, transition the shipment state to 'Lost',
    - are marked as InStock or NotDelivered, transition the shipment state to
    'Completed'.
    """
    details = _retrieve_shipment_details(
        shipment.id,
        ShipmentDetail.removed_on.is_null(),
    )

    # There must be least one NotDelivered detail because `all([])` would return true;
    # and hence make a shipment Lost that had all boxes removed before sending
    not_delivered_details = [d.lost_on is not None for d in details]
    if not_delivered_details and all(not_delivered_details):
        shipment.state = ShipmentState.Lost
        shipment.completed_by = user_id
        shipment.completed_on = now
        shipment.save(
            only=[Shipment.state, Shipment.completed_by, Shipment.completed_on]
        )

    elif all(d.lost_on is not None or d.received_on is not None for d in details):
        shipment.state = ShipmentState.Completed
        shipment.completed_by = user_id
        shipment.completed_on = now
        shipment.save(
            only=[Shipment.state, Shipment.completed_by, Shipment.completed_on]
        )


def update_shipment_when_preparing(
    *,
    shipment,
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
    if shipment.state != ShipmentState.Preparing:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Preparing], actual_state=shipment.state
        )

    if shipment.transfer_agreement_id is not None:
        _validate_bases_as_part_of_transfer_agreement(
            transfer_agreement=TransferAgreement.get_by_id(
                shipment.transfer_agreement_id
            ),
            target_base_id=target_base_id,
        )

    now = utcnow()
    with db.database.atomic():
        _update_shipment_with_prepared_boxes(
            shipment=shipment,
            user_id=user.id,
            box_label_identifiers=prepared_box_label_identifiers,
            now=now,
        )
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user.id,
            box_label_identifiers=removed_box_label_identifiers,
            box_state=BoxState.InStock,
            now=now,
        )

        if target_base_id is not None:
            shipment.target_base = target_base_id
            shipment.save(only=[Shipment.target_base])

    return shipment


def update_shipment_when_receiving(
    *,
    shipment,
    user,
    received_shipment_detail_update_inputs=None,
    lost_box_label_identifiers=None,
):
    """Update shipment detail information during reception (on shipment target side).
    - update checked-in or lost boxes
    - raise InvalidShipmentState exception if shipment state is different from
      'Receiving'
    """
    if shipment.state != ShipmentState.Receiving:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Receiving], actual_state=shipment.state
        )

    now = utcnow()
    with db.database.atomic():
        _update_shipment_with_received_boxes(
            shipment=shipment,
            shipment_detail_update_inputs=received_shipment_detail_update_inputs,
            user_id=user.id,
            now=now,
        )
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user.id,
            box_label_identifiers=lost_box_label_identifiers,
            box_state=BoxState.NotDelivered,
            now=now,
        )
    with db.database.atomic():
        _complete_shipment_if_applicable(shipment=shipment, user_id=user.id, now=now)

    return shipment


def _validate_base_as_part_of_shipment(resource_id, *, detail, model):
    """Validate that the base of the given resource (location or product) is identical
    to the target base of the detail's shipment, and that the resource exists.
    If not, raise an InvalidShipmentDetailUpdateInput exception.
    """
    try:
        target_resource = model.get_by_id(resource_id)
        valid = target_resource.base_id == detail.shipment.target_base_id
    except model.DoesNotExist:
        valid = False
    if not valid:
        raise InvalidShipmentDetailUpdateInput(model=model, detail=detail)


def mark_shipment_as_lost(*, shipment, user):
    """Change shipment state to 'Lost'. Update states of all contained
    'InTransit' boxes to 'NotDelivered' and soft-delete all shipment details by setting
    the lost_on/by fields.
    - raise InvalidShipmentState exception if shipment state is different from 'Sent'
    """
    if shipment.state != ShipmentState.Sent:
        raise InvalidShipmentState(
            expected_states=[ShipmentState.Sent], actual_state=shipment.state
        )

    now = utcnow()
    with db.database.atomic():
        shipment.state = ShipmentState.Lost
        shipment.completed_on = now
        shipment.completed_by = user.id
        box_label_identifiers = [
            d.box.label_identifier
            for d in _retrieve_shipment_details(
                shipment.id, Box.state == BoxState.InTransit
            )
        ]
        _remove_boxes_from_shipment(
            shipment_id=shipment.id,
            user_id=user.id,
            box_label_identifiers=box_label_identifiers,
            box_state=BoxState.NotDelivered,
            now=now,
        )
        shipment.save(
            only=[Shipment.state, Shipment.completed_by, Shipment.completed_on]
        )
    return shipment


def move_not_delivered_boxes_in_stock(*, box_ids, user):
    """Move boxes that were accidentally marked as NotDelivered back to InStock.
    First find all shipment details corresponding to the box IDs. Any boxes in state
    other than NotDelivered are silently filtered out.
    It is assumed that all given boxes belong to the same shipment.
    If the current user does not have permission to access the shipment's source or
    target base, raise a Forbidden error.
    The result depends on whether the user is part of the shipment source or target
    base.
    """
    details = (
        ShipmentDetail.select(ShipmentDetail, Box, Shipment)
        .join(Box)
        .join(Shipment, src=ShipmentDetail)
        .where(
            ShipmentDetail.lost_on.is_null(False),
            ShipmentDetail.box_id << box_ids,
            Box.state == BoxState.NotDelivered,
        )
    )

    shipment = details[0].shipment
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )

    now = utcnow()
    authorized_base_ids_of_user = user.authorized_base_ids("shipment:edit")
    with db.database.atomic():
        if shipment.source_base_id in authorized_base_ids_of_user:
            _move_not_delivered_box_instock_in_source_base(user.id, details, now)
        elif shipment.target_base_id in authorized_base_ids_of_user:
            _move_not_delivered_box_instock_in_target_base(
                user.id, details, shipment, now
            )

        shipment.save()

        if details:
            ShipmentDetail.bulk_update(
                details,
                [
                    ShipmentDetail.lost_on,
                    ShipmentDetail.lost_by,
                    ShipmentDetail.removed_on,
                    ShipmentDetail.removed_by,
                ],
                batch_size=BATCH_SIZE,
            )

    if shipment.state != ShipmentState.Completed:
        _complete_shipment_if_applicable(shipment=shipment, user_id=user.id, now=now)

    return shipment


def _move_not_delivered_box_instock_in_target_base(user_id, details, shipment, now):
    """Relevant in the following scenario:
    - the target side is in the process of receiving a shipment
    - person A takes a box from the shipment without using the reconciliation procedure
    - person B reconciles the shipment and since they can't find the box in the
      shipment, they mark it as NotDelivered. The shipment might become Completed
    - later the box is found in the warehouse
    - with the mutation, they can change the box state and shipment state back to
      Receiving, and reconcile the box as intended
    """
    shipment.state = ShipmentState.Receiving
    shipment.completed_on = None
    shipment.completed_by = None

    for detail in details:
        detail.lost_on = None
        detail.lost_by = None

    _bulk_update_box_state(
        boxes=[d.box for d in details],
        state=BoxState.Receiving,
        user_id=user_id,
        now=now,
    )


def _move_not_delivered_box_instock_in_source_base(user_id, details, now):
    """Relevant in the following scenario:
    - the source side had physically removed a box from the shipment before sending,
      without digitally removing it
    - the target side marks the box as NotDelivered when receiving since it's not part
      of the shipment
    - the target side might have completed the shipment (or it's still in Receiving
      state)
    - now the source side finds the previous box in their stock (state NotDelivered)
    - with the mutation, they can change the box state to InStock, and update the
      corresponding shipment detail.
    """
    for detail in details:
        detail.removed_on = now
        detail.removed_by = user_id
        detail.lost_on = None
        detail.lost_by = None

    _bulk_update_box_state(
        boxes=[d.box for d in details],
        state=BoxState.InStock,
        user_id=user_id,
        now=now,
    )
