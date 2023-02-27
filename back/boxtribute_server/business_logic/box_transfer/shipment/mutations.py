from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ....authz import authorize
from ....models.definitions.shipment import Shipment
from .crud import (
    cancel_shipment,
    create_shipment,
    mark_shipment_as_lost,
    send_shipment,
    start_receiving_shipment,
    update_shipment_when_preparing,
    update_shipment_when_receiving,
)

mutation = MutationType()


@mutation.field("createShipment")
@convert_kwargs_to_snake_case
def resolve_create_shipment(*_, creation_input):
    authorize(permission="shipment:create", base_id=creation_input["source_base_id"])
    return create_shipment(**creation_input, user=g.user)


@mutation.field("updateShipmentWhenPreparing")
@convert_kwargs_to_snake_case
def resolve_update_shipment_when_preparing(*_, update_input):
    shipment = Shipment.get_by_id(update_input["id"])
    authorize(permission="shipment:edit", base_id=shipment.source_base_id)
    return update_shipment_when_preparing(**update_input, user=g.user)


@mutation.field("updateShipmentWhenReceiving")
@convert_kwargs_to_snake_case
def resolve_update_shipment_when_receiving(*_, update_input):
    shipment = Shipment.get_by_id(update_input["id"])
    authorize(permission="shipment:edit", base_id=shipment.target_base_id)
    return update_shipment_when_receiving(**update_input, user=g.user)


@mutation.field("cancelShipment")
def resolve_cancel_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return cancel_shipment(id=id, user=g.user)


@mutation.field("sendShipment")
def resolve_send_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(permission="shipment:edit", base_id=shipment.source_base_id)
    return send_shipment(id=id, user=g.user)


@mutation.field("startReceivingShipment")
def resolve_start_receiving_shipment(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(permission="shipment:edit", base_id=shipment.target_base_id)
    return start_receiving_shipment(id=id, user=g.user)


@mutation.field("markShipmentAsLost")
def resolve_mark_shipment_as_lost(*_, id):
    shipment = Shipment.get_by_id(id)
    authorize(
        permission="shipment:edit",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return mark_shipment_as_lost(id=id, user=g.user)
