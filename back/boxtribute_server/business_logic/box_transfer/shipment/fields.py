from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.shipment import Shipment
from ....models.definitions.shipment_detail import ShipmentDetail

shipment = ObjectType("Shipment")
shipment_detail = ObjectType("ShipmentDetail")


@shipment.field("details")
def resolve_shipment_details(shipment_obj, _):
    return ShipmentDetail.select().where(
        ShipmentDetail.shipment == shipment_obj.id,
        ShipmentDetail.deleted_on.is_null(),
    )


@shipment.field("sourceBase")
def resolve_shipment_source_base(shipment_obj, _):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return shipment_obj.source_base


@shipment.field("targetBase")
def resolve_shipment_target_base(shipment_obj, _):
    authorize(
        permission="base:read",
        base_ids=[shipment_obj.source_base_id, shipment_obj.target_base_id],
    )
    return shipment_obj.target_base


@shipment_detail.field("sourceProduct")
def resolve_shipment_detail_source_product(detail_obj, _):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.source_product


@shipment_detail.field("targetProduct")
def resolve_shipment_detail_target_product(detail_obj, _):
    authorize(
        permission="product:read",
        base_ids=[
            detail_obj.shipment.source_base_id,
            detail_obj.shipment.target_base_id,
        ],
    )
    return detail_obj.target_product


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


@shipment_detail.field("shipment")
def resolve_shipment(shipment_detail_obj, _):
    shipment = Shipment.get_by_id(shipment_detail_obj.shipment_id)
    authorize(
        permission="shipment:read",
        base_ids=[shipment.source_base_id, shipment.target_base_id],
    )
    return shipment
