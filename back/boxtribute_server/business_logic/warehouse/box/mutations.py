from dataclasses import dataclass
from typing import Any

from ariadne import MutationType
from flask import g

from ....authz import (
    authorize,
    authorize_for_accessing_box,
    authorized_bases_filter,
    handle_unauthorized,
)
from ....db import execute_sql
from ....enums import TaggableObjectType, TagType
from ....errors import (
    DeletedLocation,
    InvalidFilterInput,
    ResourceDoesNotExist,
)
from ....graph_ql.filtering import derive_box_filter
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.tag import Tag
from ....models.definitions.tags_relation import TagsRelation
from ...tag.crud import unassign_tags_from_resources
from ...tag.validation import validate_tags
from .crud import (
    WAREHOUSE_BOX_STATES,
    BoxesResult,
    assign_missing_tags_to_boxes,
    create_box,
    create_box_from_box,
    create_boxes,
    delete_boxes,
    move_boxes_to_location,
    update_box,
    update_marked_for_shipment_box,
)
from .sql import BOXES_WITH_MISSING_TAGS_QUERY

mutation = MutationType()


@dataclass(kw_only=True)
class BoxesTagsOperationResult(BoxesResult):
    tag_error_info: list[dict[str, Any]]


@mutation.field("createBox")
def resolve_create_box(*_, creation_input):
    requested_location = Location.get_by_id(creation_input.pop("location_id"))
    authorize(permission="stock:write", base_id=requested_location.base_id)
    authorize(permission="location:read", base_id=requested_location.base_id)

    requested_product = Product.get_by_id(creation_input.pop("product_id"))
    authorize(permission="product:read", base_id=requested_product.base_id)

    authorize(permission="tags_relation:write")
    tag_ids = creation_input.pop("tag_ids", [])
    tags = list(Tag.select().where(Tag.id << tag_ids))
    for tag in tags:
        authorize(permission="tag:read", base_id=tag.base_id)

    return create_box(
        user_id=g.user.id,
        product=requested_product,
        location=requested_location,
        tags=tags,
        **creation_input,
    )


@mutation.field("createBoxFromBox")
@handle_unauthorized
def resolve_create_box_from_box(*_, creation_input):
    location_id = creation_input["location_id"]
    requested_location = Location.get_or_none(Location.id == location_id)
    if requested_location is None:
        return ResourceDoesNotExist(name="Location", id=location_id)
    authorize(permission="stock:write", base_id=requested_location.base_id)

    source_box_label_identifier = creation_input["source_box_label_identifier"]
    source_box = (
        Box.select(Box, Location, Product)
        .join(Location)  # for box.location attribute in authorize_for_accessing_box()
        .join(Product, src=Box)  # for box.product in CRUD function
        .where(Box.label_identifier == source_box_label_identifier)
        .get_or_none()
    )
    if source_box is None:
        return ResourceDoesNotExist(name="Box", id=source_box_label_identifier)
    authorize_for_accessing_box(source_box, action="write")

    return create_box_from_box(
        user_id=g.user.id,
        source_box=source_box,
        location=requested_location,
        number_of_items=creation_input["number_of_items"],
    )


@mutation.field("createBoxes")
@handle_unauthorized
def resolve_create_boxes(*_, creation_input):
    # Authz is complex and hence moved into the crud function
    return create_boxes(user_id=g.user.id, data=creation_input)


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

    authorize(permission="tags_relation:write")
    tag_ids = update_input.pop("tag_ids", None)
    tags = None
    if tag_ids is not None:
        tags = list(Tag.select().where(Tag.id << tag_ids))
        for tag in tags:
            authorize(permission="tag:read", base_id=tag.base_id)

    return update_box(user_id=g.user.id, tags=tags, **update_input)


@mutation.field("updateMarkedForShipmentBox")
def resolve_update_marked_for_shipment_box(*_, update_input):
    box = (
        Box.select(Box, Location)
        .join(Location)
        .where(Box.label_identifier == update_input["label_identifier"])
        .get()
    )
    authorize(permission="stock:write", base_id=box.location.base_id)

    return update_marked_for_shipment_box(user_id=g.user.id, **update_input)


# Common logic for bulk-action resolvers:
# - act either on concrete label identifiers OR on specified filters to find boxes to
# apply the action to
# - remove possible duplicates from input label identifiers
# - filter out all boxes that
#   - don't exist and/or
#   - are in a location the user is prohibited to access and/or
#   - are deleted and/or
#   - are not in a "warehouse" state (MarkedForShipment, InTransit, Receiving,
#     NotDelivered) and/or
#   - (depending on the context) would not be affected by the action anyways
#   - don't match the specified filters, if any
# - perform the requested action on all valid boxes
# - create list of invalid boxes (difference of the set of input label identifiers and
#   the set of valid label identifiers. Boxes surfaced solely via `filters` are not
#   counted as "invalid" if excluded.)
# - return valid, updated boxes and invalid box label identifiers as BoxesResult data
#   structure for GraphQL API
def _is_valid_selection(label_identifiers, filters):
    """Boxes must be selected by either label identifiers OR filters"""
    return (label_identifiers is None) != (filters is None)


@mutation.field("deleteBoxes")
@handle_unauthorized
def resolve_delete_boxes(*_, label_identifiers=None, filters=None):
    if not _is_valid_selection(label_identifiers, filters):
        return InvalidFilterInput()

    box_selection = Box.select(Box, Location).join(Location)
    filter_conditions, selection = derive_box_filter(filters, box_selection)

    conditions = [
        authorized_bases_filter(Location, permission="stock:write"),
        Box.state << WAREHOUSE_BOX_STATES,
        (~Box.deleted_on | Box.deleted_on.is_null()),
        *filter_conditions,
    ]

    # Invalid box label identifiers are derived solely from the label identifiers input
    label_identifiers = set(label_identifiers or [])
    if filters is None:
        conditions.append(Box.label_identifier << label_identifiers)

    boxes = selection.where(*conditions).order_by(Box.id)
    valid_box_label_identifiers = {
        box.label_identifier
        for box in boxes
        if box.label_identifier in label_identifiers
    }

    return BoxesResult(
        updated_boxes=delete_boxes(user_id=g.user.id, boxes=boxes),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


@mutation.field("moveBoxesToLocation")
@handle_unauthorized
def resolve_move_boxes_to_location(*_, update_input):
    label_identifiers = update_input.get("label_identifiers")
    filters = update_input.get("filters")
    if not _is_valid_selection(label_identifiers, filters):
        return InvalidFilterInput()

    location_id = update_input["location_id"]
    if (location := Location.get_or_none(location_id)) is None:
        return ResourceDoesNotExist(name="Location", id=location_id)
    authorize(permission="stock:write", base_id=location.base_id)
    if location.deleted_on is not None:
        return DeletedLocation(name=location.name)

    box_selection = Box.select(Box, Location).join(Location)
    filter_conditions, selection = derive_box_filter(filters, box_selection)
    conditions = [
        # Any boxes already in the new location are silently ignored
        Box.location != location_id,
        # Any boxes in a base other than the one of the requested location are
        # ignored. No need for authz filter because already applied above
        Location.base == location.base_id,
        Box.state << WAREHOUSE_BOX_STATES,
        (~Box.deleted_on | Box.deleted_on.is_null()),
        *filter_conditions,
    ]
    # Invalid box label identifiers are derived solely from the label identifiers input
    label_identifiers = set(label_identifiers or [])
    if filters is None:
        conditions.append(Box.label_identifier << label_identifiers)

    boxes = selection.where(*conditions).order_by(Box.id)
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxesResult(
        updated_boxes=move_boxes_to_location(
            user_id=g.user.id, boxes=boxes, location=location
        ),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


def _validate_tags(tag_ids, for_unassigning=False):
    return validate_tags(
        tag_ids,
        expected_type=TagType.Box,
        permission="stock:write",
        for_unassigning=for_unassigning,
    )


@mutation.field("assignTagsToBoxes")
@handle_unauthorized
def resolve_assign_tags_to_boxes(*_, update_input):
    authorize(permission="tags_relation:write")

    label_identifiers = update_input.get("label_identifiers")
    filters = update_input.get("filters")
    if not _is_valid_selection(label_identifiers, filters):
        return InvalidFilterInput()

    tag_ids = set(update_input["tag_ids"])
    valid_tag_ids, tag_errors, tags_base_id = _validate_tags(tag_ids)

    if not valid_tag_ids:
        return BoxesTagsOperationResult(
            updated_boxes=[],
            invalid_box_label_identifiers=[],
            tag_error_info=tag_errors,
        )

    # Invalid box label identifiers are derived solely from the label identifiers input
    input_label_identifiers = set(label_identifiers or [])
    if filters is None:
        selected_label_identifiers = input_label_identifiers
    else:
        box_selection = Box.select(Box, Location).join(Location)
        filter_conditions, selection = derive_box_filter(filters, box_selection)
        selected_label_identifiers = {
            box.label_identifier
            for box in selection.where(
                Location.base == tags_base_id,
                Box.state << WAREHOUSE_BOX_STATES,
                (~Box.deleted_on | Box.deleted_on.is_null()),
                *filter_conditions,
            )
        }

    valid_boxes = (
        execute_sql(
            selected_label_identifiers,
            tags_base_id,
            WAREHOUSE_BOX_STATES,
            valid_tag_ids,
            query=BOXES_WITH_MISSING_TAGS_QUERY,
        )
        if selected_label_identifiers
        else []
    )
    label_identifiers = input_label_identifiers
    valid_box_label_identifiers = {box["label_identifier"] for box in valid_boxes}

    return BoxesTagsOperationResult(
        updated_boxes=assign_missing_tags_to_boxes(
            user_id=g.user.id, boxes=valid_boxes
        ),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
        tag_error_info=tag_errors,
    )


@mutation.field("unassignTagsFromBoxes")
@handle_unauthorized
def resolve_unassign_tags_from_boxes(*_, update_input):
    authorize(permission="tags_relation:write")

    label_identifiers = update_input.get("label_identifiers")
    filters = update_input.get("filters")
    if not _is_valid_selection(label_identifiers, filters):
        return InvalidFilterInput()

    tag_ids = set(update_input["tag_ids"])
    valid_tag_ids, tag_errors, tags_base_id = _validate_tags(
        tag_ids, for_unassigning=True
    )

    if not valid_tag_ids:
        return BoxesTagsOperationResult(
            updated_boxes=[],
            invalid_box_label_identifiers=[],
            tag_error_info=tag_errors,
        )

    box_selection = Box.select(Box, Location).join(Location)
    filter_conditions, selection = derive_box_filter(filters, box_selection)
    conditions = [
        # Boxes without any of the requested tags assigned are silently ignored
        Box.id
        << TagsRelation.select(TagsRelation.object_id).where(
            TagsRelation.object_type == TaggableObjectType.Box,
            TagsRelation.tag << valid_tag_ids,
            TagsRelation.deleted_on.is_null(),
        ),
        # Boxes in bases different from the tags' common base are filtered out
        Location.base == tags_base_id,
        Box.state << WAREHOUSE_BOX_STATES,
        (~Box.deleted_on | Box.deleted_on.is_null()),
        *filter_conditions,
    ]
    # Invalid box label identifiers are derived solely from the label identifiers input
    label_identifiers = set(label_identifiers or [])
    if filters is None:
        conditions.append(Box.label_identifier << label_identifiers)

    boxes = selection.where(*conditions).order_by(Box.id)
    valid_box_ids = {box.id for box in boxes}
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxesTagsOperationResult(
        updated_boxes=unassign_tags_from_resources(
            user_id=g.user.id,
            model=Box,
            object_type=TaggableObjectType.Box,
            resource_ids=valid_box_ids,
            tag_ids=valid_tag_ids,
        ),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
        tag_error_info=tag_errors,
    )
