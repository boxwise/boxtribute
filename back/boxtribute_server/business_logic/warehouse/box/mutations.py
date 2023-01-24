from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ....authz import authorize
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.tag import Tag
from .crud import create_box, update_box

mutation = MutationType()


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
