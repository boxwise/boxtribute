from ariadne import ObjectType

from ....authz import authorize
from ....exceptions import Forbidden
from .crud import get_box_history

box = ObjectType("Box")
unboxed_items_collection = ObjectType("UnboxedItemsCollection")


@box.field("qrCode")
def resolve_box_qr_code(box_obj, _):
    authorize(permission="qr:read")
    return box_obj.qr_code


@box.field("tags")
def resolve_box_tags(box_obj, info):
    return info.context["tags_for_box_loader"].load(box_obj.id)


@box.field("history")
def resolve_box_history(box_obj, _):
    authorize(permission="history:read")
    return get_box_history(box_obj.id)


@box.field("product")
@unboxed_items_collection.field("product")
async def resolve_box_product(box_obj, info):
    product = await info.context["product_loader"].load(box_obj.product_id)
    # In the context of a shipment, if the target party wants to access a box that is
    # not yet in their stock, they'll query for Box.product but we don't want it to
    # raise an error; instead return None
    try:
        authorize(permission="product:read", base_id=product.base_id)
        return product
    except Forbidden:
        return


@box.field("size")
def resolve_box_size(box_obj, info):
    return info.context["size_loader"].load(box_obj.size_id)


@box.field("location")
async def resolve_box_location(box_obj, info):
    location = await info.context["location_loader"].load(box_obj.location_id)
    # See comment in resolve_box_product()
    try:
        authorize(permission="location:read", base_id=location.base_id)
        return location
    except Forbidden:
        return


@box.field("state")
def resolve_box_state(box_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return box_obj.state_id


@box.field("shipmentDetail")
def resolve_box_shipment_detail(box_obj, info):
    authorize(permission="shipment_detail:read")
    return info.context["shipment_detail_for_box_loader"].load(box_obj.id)
