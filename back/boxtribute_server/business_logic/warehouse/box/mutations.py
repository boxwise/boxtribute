from dataclasses import dataclass

from ariadne import MutationType
from flask import g
from peewee import JOIN

from ....authz import authorize, authorized_bases_filter, handle_unauthorized
from ....enums import TaggableObjectType, TagType
from ....errors import (
    DeletedLocation,
    DeletedTag,
    ResourceDoesNotExist,
    TagTypeMismatch,
)
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


@dataclass(kw_only=True)
class BoxResult:
    updated_boxes: list[Box]
    invalid_box_label_identifiers: list[str]


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


# Common logic for bulk-action resolvers:
# - remove possible duplicates from input label identifiers
# - filter out all boxes that
#   - don't exist and/or
#   - are in a location the user is prohibited to access and/or
#   - are deleted and/or
#   - (depending on the context) would not be affected by the action anyways
# - perform the requested action on all valid boxes
# - create list of invalid boxes (difference of the set of input label identifiers and
#   the set of valid label identifiers)
# - return valid, updated boxes and invalid box label identifiers as BoxResult data
#   structure for GraphQL API
@mutation.field("deleteBoxes")
@handle_unauthorized
def resolve_delete_boxes(*_, label_identifiers):
    label_identifiers = set(label_identifiers)
    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .where(
            Box.label_identifier << label_identifiers,
            authorized_bases_filter(Location, permission="stock:write"),
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxResult(
        updated_boxes=delete_boxes(user_id=g.user.id, boxes=boxes),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


@mutation.field("moveBoxesToLocation")
@handle_unauthorized
def resolve_move_boxes_to_location(*_, update_input):
    location_id = update_input["location_id"]
    if (location := Location.get_or_none(location_id)) is None:
        return ResourceDoesNotExist(name="Location", id=location_id)
    authorize(permission="stock:write", base_id=location.base_id)
    if location.deleted_on is not None:
        return DeletedLocation(name=location.name)

    label_identifiers = set(update_input["label_identifiers"])
    boxes = (
        Box.select(Box, Location)
        .join(Location)
        .where(
            Box.label_identifier << label_identifiers,
            authorized_bases_filter(Location, permission="stock:write"),
            # Any boxes already in the new location are silently ignored
            Box.location != location_id,
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxResult(
        updated_boxes=move_boxes_to_location(
            user_id=g.user.id, boxes=boxes, location=location
        ),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


@mutation.field("assignTagToBoxes")
@handle_unauthorized
def resolve_assign_tag_to_boxes(*_, update_input):
    tag_id = update_input["tag_id"]
    if (tag := Tag.get_or_none(tag_id)) is None:
        return ResourceDoesNotExist(name="Tag", id=tag_id)
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    if tag.deleted_on is not None:
        return DeletedTag(name=tag.name)
    if tag.type == TagType.Beneficiary:
        return TagTypeMismatch(expected_type=TagType.Box)

    label_identifiers = set(update_input["label_identifiers"])
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
            Box.label_identifier << label_identifiers,
            authorized_bases_filter(Location, permission="stock:write"),
            # Any boxes that already have the new tag assigned are silently ignored
            (TagsRelation.tag != tag.id) | (TagsRelation.tag.is_null()),
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxResult(
        updated_boxes=assign_tag_to_boxes(user_id=g.user.id, boxes=boxes, tag=tag),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


@mutation.field("unassignTagFromBoxes")
@handle_unauthorized
def resolve_unassign_tag_from_boxes(*_, update_input):
    tag_id = update_input["tag_id"]
    if (tag := Tag.get_or_none(tag_id)) is None:
        return ResourceDoesNotExist(name="Tag", id=tag_id)
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    if tag.deleted_on is not None:
        return DeletedTag(name=tag.name)
    if tag.type == TagType.Beneficiary:
        return TagTypeMismatch(expected_type=TagType.Box)

    label_identifiers = set(update_input["label_identifiers"])
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
            Box.label_identifier << label_identifiers,
            authorized_bases_filter(Location, permission="stock:write"),
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxResult(
        updated_boxes=unassign_tag_from_boxes(user_id=g.user.id, boxes=boxes, tag=tag),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )
