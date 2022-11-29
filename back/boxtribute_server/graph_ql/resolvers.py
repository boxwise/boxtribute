"""GraphQL resolver functionality"""
import os

from ariadne import MutationType, QueryType, convert_kwargs_to_snake_case
from boxtribute_server.exceptions import MobileDistroFeatureFlagNotAssignedToUser
from flask import g

from ..authz import authorize, authorized_bases_filter
from ..enums import LocationType
from ..models.crud import create_box, create_qr_code, get_box_history, update_box
from ..models.definitions.box import Box
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.qr_code import QrCode
from ..models.definitions.tag import Tag
from .bindables import (
    beneficiary,
    box,
    classic_location,
    distribution_spot,
    product,
    qr_code,
    unboxed_items_collection,
)
from .filtering import derive_box_filter
from .pagination import load_into_page

query = QueryType()
mutation = MutationType()


def mobile_distro_feature_flag_check(user_id):
    deployment_environment = os.getenv("ENVIRONMENT")
    if deployment_environment in ["development", "staging", "test"]:
        return

    allowed_user_ids_str = os.getenv("MOBILE_DISTRO_ALLOWED_USER_IDS")
    if allowed_user_ids_str is not None:
        allowed_user_ids_as_numbers = [int(i) for i in allowed_user_ids_str.split(",")]
        if user_id in allowed_user_ids_as_numbers:
            return

    if g.user.is_god:
        return

    raise MobileDistroFeatureFlagNotAssignedToUser(user_id)


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
@box.field("qrCode")
@convert_kwargs_to_snake_case
def resolve_qr_code(obj, _, qr_code=None):
    authorize(permission="qr:read")
    return obj.qr_code if qr_code is None else QrCode.get(QrCode.code == qr_code)


@box.field("tags")
def resolve_box_tags(box_obj, info):
    return info.context["tags_for_box_loader"].load(box_obj.id)


@box.field("history")
def resolve_box_history(box_obj, _):
    authorize(permission="history:read")
    return get_box_history(box_obj.id)


@query.field("product")
def resolve_product(*_, id):
    product = Product.get_by_id(id)
    authorize(permission="product:read", base_id=product.base_id)
    return product


@box.field("product")
@unboxed_items_collection.field("product")
def resolve_box_product(obj, info):
    return info.context["product_loader"].load(obj.product_id)


@box.field("size")
def resolve_size(box_obj, info):
    return info.context["size_loader"].load(box_obj.size_id)


@query.field("box")
@convert_kwargs_to_snake_case
def resolve_box(*_, label_identifier):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == label_identifier)
        .get()
    )
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box


@query.field("location")
def resolve_location(obj, _, id):
    location = Location.get_by_id(id)
    if location.type == LocationType.ClassicLocation:
        authorize(permission="location:read", base_id=location.base_id)
        return location


@box.field("location")
def resolve_box_location(obj, _):
    authorize(permission="location:read", base_id=obj.location.base_id)
    return obj.location


@query.field("locations")
def resolve_locations(*_):
    return Location.select().where(
        Location.type == LocationType.ClassicLocation, authorized_bases_filter(Location)
    )


@query.field("products")
@convert_kwargs_to_snake_case
def resolve_products(*_, pagination_input=None):
    return load_into_page(
        Product,
        authorized_bases_filter(Product),
        pagination_input=pagination_input,
    )


@box.field("state")
def resolve_box_state(box_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return box_obj.state_id


@classic_location.field("defaultBoxState")
def resolve_location_default_box_state(location_obj, _):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return location_obj.box_state_id


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(*_, box_label_identifier=None):
    authorize(permission="qr:create")
    return create_qr_code(box_label_identifier=box_label_identifier)


@mutation.field("createBox")
@convert_kwargs_to_snake_case
def resolve_create_box(*_, creation_input):
    requested_location = Location.get_by_id(creation_input["location_id"])
    authorize(permission="stock:write", base_id=requested_location.base_id)
    authorize(permission="location:read", base_id=requested_location.base_id)
    requested_product = Product.get_by_id(creation_input["product_id"])
    authorize(permission="product:read", base_id=requested_product.base_id)

    tag_ids = creation_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag_relation:assign", base_id=t.base_id)

    return create_box(user_id=g.user.id, **creation_input)


@mutation.field("updateBox")
@convert_kwargs_to_snake_case
def resolve_update_box(*_, update_input):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == update_input["label_identifier"])
        .get()
    )
    authorize(permission="stock:write", base_id=box.location.base_id)

    location_id = update_input.get("location_id")
    if location_id is not None:
        requested_location = Location.get_by_id(location_id)
        authorize(permission="location:read", base_id=requested_location.base_id)

    product_id = update_input.get("product_id")
    if product_id is not None:
        requested_product = Product.get_by_id(product_id)
        authorize(permission="product:read", base_id=requested_product.base_id)

    tag_ids = update_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag_relation:assign", base_id=t.base_id)

    return update_box(user_id=g.user.id, **update_input)


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
@distribution_spot.field("base")
@classic_location.field("base")
@product.field("base")
def resolve_resource_base(obj, _):
    authorize(permission="base:read", base_id=obj.base_id)
    return obj.base


@product.field("category")
def resolve_product_product_category(product_obj, info):
    return info.context["product_category_loader"].load(product_obj.category_id)


@product.field("sizeRange")
def resolve_product_size_range(product_obj, info):
    return info.context["size_range_loader"].load(product_obj.size_range_id)


@product.field("gender")
def resolve_product_gender(product_obj, _):
    # Instead of a ProductGender instance return an integer for EnumType conversion
    return product_obj.gender_id


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, _):
    box = Box.select().join(Location).where(Box.qr_code == qr_code_obj.id).get()
    authorize(permission="stock:read", base_id=box.location.base_id)
    return box
