"""GraphQL resolver functionality"""
from ariadne import MutationType, QueryType, convert_kwargs_to_snake_case

from ..authz import authorize, authorized_bases_filter
from ..enums import LocationType
from ..models.crud import create_qr_code
from ..models.definitions.box import Box
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.qr_code import QrCode
from .bindables import beneficiary, classic_location, qr_code, unboxed_items_collection
from .filtering import derive_box_filter
from .pagination import load_into_page

query = QueryType()
mutation = MutationType()


@query.field("qrExists")
@convert_kwargs_to_snake_case
def resolve_qr_exists(*_, qr_code):
    authorize(permission="qr:read")
    try:
        QrCode.get_id_from_code(qr_code)
    except QrCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
@convert_kwargs_to_snake_case
def resolve_qr_code(obj, _, qr_code=None):
    authorize(permission="qr:read")
    return obj.qr_code if qr_code is None else QrCode.get(QrCode.code == qr_code)


@unboxed_items_collection.field("product")
def resolve_box_product(obj, info):
    return info.context["product_loader"].load(obj.product_id)


@query.field("location")
def resolve_location(obj, _, id):
    location = Location.get_by_id(id)
    if location.type == LocationType.ClassicLocation:
        authorize(permission="location:read", base_id=location.base_id)
        return location


@query.field("locations")
def resolve_locations(*_):
    return Location.select().where(
        Location.type == LocationType.ClassicLocation, authorized_bases_filter(Location)
    )


@classic_location.field("defaultBoxState")
def resolve_location_default_box_state(location_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return location_obj.box_state_id


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(box_label_identifier=box_label_identifier)


@classic_location.field("boxes")
@convert_kwargs_to_snake_case
def resolve_location_boxes(location_obj, _, pagination_input=None, filter_input=None):
    authorize(permission="stock:read", base_id=location_obj.base_id)
    location_filter_condition = Box.location == location_obj.id
    filter_condition = location_filter_condition & derive_box_filter(filter_input)
    selection = Box.select()
    if filter_input is not None and any(
        [f in filter_input for f in ["product_gender", "product_category_id"]]
    ):
        selection = Box.select().join(Product)
    return load_into_page(
        Box, filter_condition, selection=selection, pagination_input=pagination_input
    )


@beneficiary.field("base")
@classic_location.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read", base_id=obj.base_id)
    return obj.base


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    box = Box.select().join(Location).where(Box.qr_code == qr_code_obj.id).get()
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box
