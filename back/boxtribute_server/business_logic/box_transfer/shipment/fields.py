from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.shipment import Shipment
from ....models.definitions.shipment_detail import ShipmentDetail

shipment = ObjectType("Shipment")
shipment_detail = ObjectType("ShipmentDetail")


@shipment.field("details")
def resolve_shipment_details(shipment_obj, _):
    authorize(permission="shipment_detail:read")
    return ShipmentDetail.select().where(ShipmentDetail.shipment == shipment_obj.id)


@shipment.field("sourceBase")
def resolve_shipment_source_base(shipment_obj, info):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return info.context["base_loader"].load(shipment_obj.source_base_id)


@shipment.field("targetBase")
def resolve_shipment_target_base(shipment_obj, info):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return info.context["base_loader"].load(shipment_obj.target_base_id)


@shipment.field("startedBy")
def resolve_shipment_started_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.started_by_id)


@shipment.field("sentBy")
def resolve_shipment_sent_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.sent_by_id)


@shipment.field("canceledBy")
def resolve_shipment_canceled_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.canceled_by_id)


@shipment.field("receivingStartedBy")
def resolve_shipment_receiving_started_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.receiving_started_by_id)


@shipment.field("completedBy")
def resolve_shipment_completed_by(shipment_obj, info):
    return info.context["user_loader"].load(shipment_obj.completed_by_id)


@shipment_detail.field("sourceProduct")
def resolve_shipment_detail_source_product(detail_obj, info):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["product_loader"].load(detail_obj.source_product_id)


@shipment_detail.field("targetProduct")
def resolve_shipment_detail_target_product(detail_obj, info):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return info.context["product_loader"].load(detail_obj.target_product_id)


@shipment_detail.field("sourceLocation")
def resolve_shipment_detail_source_location(detail_obj, _):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.source_location


@shipment_detail.field("targetLocation")
def resolve_shipment_detail_target_location(detail_obj, _):
    authorize(
        permission="location:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.target_location


@shipment_detail.field("sourceSize")
def resolve_shipment_detail_source_size(detail_obj, _):
    authorize(permission="size:read")
    return detail_obj.source_size


@shipment_detail.field("targetSize")
def resolve_shipment_detail_target_size(detail_obj, _):
    authorize(permission="size:read")
    return detail_obj.target_size


@shipment_detail.field("shipment")
def resolve_shipment(shipment_detail_obj, _):
    shipment = Shipment.get_by_id(shipment_detail_obj.shipment_id)
    authorize(
        permission="shipment:read",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return shipment


@shipment_detail.field("createdBy")
def resolve_shipment_detail_created_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.created_by_id)


@shipment_detail.field("removedBy")
def resolve_shipment_detail_removed_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.removed_by_id)


@shipment_detail.field("lostBy")
def resolve_shipment_detail_lost_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.lost_by_id)


@shipment_detail.field("receivedBy")
def resolve_shipment_detail_received_by(detail_obj, info):
    return info.context["user_loader"].load(detail_obj.received_by_id)
