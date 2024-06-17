from ariadne import MutationType
from flask import g
from peewee import JOIN

from ....authz import authorize, authorized_bases_filter, handle_unauthorized
from ....enums import TaggableObjectType, TagType
from ....errors import ResourceDoesNotExist, TagTypeMismatch
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.tag import Tag
from ....models.definitions.tags_relation import TagsRelation
from .crud import (
    assign_tag_to_boxes,
    create_box,
    delete_boxes,
    move_boxes_to_location,
    unassign_tag_from_boxes,
    update_box,
)

mutation = MutationType()


class BoxPage(dict):
    pass


@mutation.field("createBox")
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


@mutation.field("deleteBoxes")
@handle_unauthorized
def resolve_delete_boxes(*_, label_identifiers):
    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .where(
            # Any non-existing boxes are silently ignored
            Box.label_identifier << label_identifiers,
            # Any boxes that are not part of the user's base are silently ignored
            authorized_bases_filter(Location, permission="stock:write"),
            # Any boxes that have already been deleted are silently ignored
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )

    # Return as BoxPage data structure for GraphQL API
    return BoxPage(
        **{
            "elements": delete_boxes(user_id=g.user.id, boxes=boxes),
            "total_count": len(boxes),
            "page_info": None,  # not relevant
        }
    )


@mutation.field("moveBoxesToLocation")
@handle_unauthorized
def resolve_move_boxes_to_location(*_, update_input):
    location_id = update_input["location_id"]
    if (location := Location.get_or_none(location_id)) is None:
        return ResourceDoesNotExist(name="Location", id=location_id)
    authorize(permission="stock:write", base_id=location.base_id)

    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .where(
            # Any non-existing boxes are silently ignored
            Box.label_identifier << update_input["label_identifiers"],
            # Any boxes that are not part of the user's base are silently ignored
            authorized_bases_filter(Location, permission="stock:write"),
            # Any boxes already in the new location are silently ignored
            Box.location != location_id,
        )
        .order_by(Box.id)
    )

    return BoxPage(
        **{
            "elements": move_boxes_to_location(
                user_id=g.user.id, boxes=boxes, location=location
            ),
            "total_count": len(boxes),
            "page_info": None,  # not relevant
        }
    )


@mutation.field("assignTagToBoxes")
@handle_unauthorized
def resolve_assign_tag_to_boxes(*_, update_input):
    tag_id = update_input["tag_id"]
    if (tag := Tag.get_or_none(tag_id)) is None:
        return ResourceDoesNotExist(name="Tag", id=tag_id)
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    if tag.type == TagType.Beneficiary:
        return TagTypeMismatch(expected_type=TagType.Box)

    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            on=(
                (TagsRelation.object_id == Box.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
            ),
        )
        .where(
            # Any non-existing boxes are silently ignored
            Box.label_identifier << update_input["label_identifiers"],
            # Any boxes that are not part of the user's base are silently ignored
            authorized_bases_filter(Location, permission="stock:write"),
            # Any boxes that already have the new tag assigned are silently ignored
            (TagsRelation.tag != tag.id) | (TagsRelation.tag.is_null()),
        )
        .order_by(Box.id)
    )

    return BoxPage(
        **{
            "elements": assign_tag_to_boxes(user_id=g.user.id, boxes=boxes, tag=tag),
            "total_count": len(boxes),
            "page_info": None,  # not relevant
        }
    )


@mutation.field("unassignTagFromBoxes")
@handle_unauthorized
def resolve_unassign_tag_from_boxes(*_, update_input):
    tag_id = update_input["tag_id"]
    if (tag := Tag.get_or_none(tag_id)) is None:
        return ResourceDoesNotExist(name="Tag", id=tag_id)
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    if tag.type == TagType.Beneficiary:
        return TagTypeMismatch(expected_type=TagType.Box)

    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .join(
            TagsRelation,
            on=(
                (TagsRelation.object_id == Box.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
                # Any boxes that don't have the tag assigned are silently ignored
                & (TagsRelation.tag == tag_id)
            ),
        )
        .where(
            # Any non-existing boxes are silently ignored
            Box.label_identifier << update_input["label_identifiers"],
            # Any boxes that are not part of the user's base are silently ignored
            authorized_bases_filter(Location, permission="stock:write"),
        )
        .order_by(Box.id)
    )

    return BoxPage(
        **{
            "elements": unassign_tag_from_boxes(
                user_id=g.user.id, boxes=boxes, tag=tag
            ),
            "total_count": len(boxes),
            "page_info": None,  # not relevant
        }
    )
