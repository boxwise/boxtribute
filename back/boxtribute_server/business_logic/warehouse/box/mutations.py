from dataclasses import dataclass
from typing import Any

from ariadne import MutationType
from flask import g
from sentry_sdk import capture_message as emit_sentry_message

from ....authz import authorize, authorized_bases_filter, handle_unauthorized
from ....db import db
from ....enums import BoxState, TaggableObjectType, TagType
from ....errors import (
    DeletedLocation,
    DeletedTag,
    ResourceDoesNotExist,
    TagBaseMismatch,
    TagTypeMismatch,
)
from ....models.definitions.box import Box
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.tag import Tag
from ....models.definitions.tags_relation import TagsRelation
from .crud import (
    assign_missing_tags_to_boxes,
    create_box,
    delete_boxes,
    move_boxes_to_location,
    unassign_tag_from_boxes,
    update_box,
)

mutation = MutationType()


@dataclass(kw_only=True)
class BoxesResult:
    updated_boxes: list[Box]
    invalid_box_label_identifiers: list[str]


@dataclass(kw_only=True)
class AssignTagsToBoxesResult(BoxesResult):
    tag_error_info: list[dict[str, Any]]


@mutation.field("createBox")
def resolve_create_box(*_, creation_input):
    requested_location = Location.get_by_id(creation_input["location_id"])
    authorize(permission="stock:write", base_id=requested_location.base_id)
    authorize(permission="location:read", base_id=requested_location.base_id)
    requested_product = Product.get_by_id(creation_input["product_id"])
    authorize(permission="product:read", base_id=requested_product.base_id)
    authorize(permission="tag_relation:assign")
    tag_ids = creation_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag:read", base_id=t.base_id)

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

    authorize(permission="tag_relation:assign")
    tag_ids = update_input.get("tag_ids", [])
    for t in Tag.select().where(Tag.id << tag_ids):
        authorize(permission="tag:read", base_id=t.base_id)

    return update_box(user_id=g.user.id, **update_input)


# Common logic for bulk-action resolvers:
# - remove possible duplicates from input label identifiers
# - filter out all boxes that
#   - don't exist and/or
#   - are in a location the user is prohibited to access and/or
#   - are deleted and/or
#   - are not in a "warehouse" state (MarkedForShipment, InTransit, Receiving,
#     NotDelivered) and/or
#   - (depending on the context) would not be affected by the action anyways
# - perform the requested action on all valid boxes
# - create list of invalid boxes (difference of the set of input label identifiers and
#   the set of valid label identifiers)
# - return valid, updated boxes and invalid box label identifiers as BoxesResult data
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
            Box.state
            << (BoxState.InStock, BoxState.Lost, BoxState.Donated, BoxState.Scrap),
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxesResult(
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
            # Any boxes already in the new location are silently ignored
            Box.location != location_id,
            # Any boxes in a base other than the one of the requested location are
            # ignored. No need for authz filter because already applied above
            Location.base == location.base_id,
            (~Box.deleted_on | Box.deleted_on.is_null()),
        )
        .order_by(Box.id)
    )
    valid_box_label_identifiers = {box.label_identifier for box in boxes}

    return BoxesResult(
        updated_boxes=move_boxes_to_location(
            user_id=g.user.id, boxes=boxes, location=location
        ),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )


@handle_unauthorized
def authorize_tag(tag):
    authorize(permission="tag_relation:assign")
    authorize(permission="tag:read", base_id=tag.base_id)


def _validate_tags(tag_ids):
    tag_errors = []
    valid_tags = []
    for tag_id in tag_ids:
        if (tag := Tag.get_or_none(tag_id)) is None:
            tag_errors.append(
                {"id": tag_id, "error": ResourceDoesNotExist(name="Tag", id=tag_id)}
            )
            continue

        if (error := authorize_tag(tag)) is not None:
            tag_errors.append({"id": tag_id, "error": error})
            continue

        if tag.deleted_on is not None:
            tag_errors.append({"id": tag_id, "error": DeletedTag(name=tag.name)})
            continue

        if tag.type == TagType.Beneficiary:
            tag_errors.append(
                {"id": tag_id, "error": TagTypeMismatch(expected_type=TagType.Box)}
            )
            continue

        valid_tags.append(tag)

    tag_base_ids = {t.base_id for t in valid_tags}
    # All requested tags must be registered in the same base
    if len(tag_base_ids) > 1:
        return [], tag_errors + [
            {"id": tag_id, "error": TagBaseMismatch()} for tag_id in tag_ids
        ]

    return [tag.id for tag in valid_tags], tag_errors


@mutation.field("assignTagsToBoxes")
def resolve_assign_tags_to_boxes(*_, update_input):
    tag_ids = set(update_input["tag_ids"])
    valid_tag_ids, tag_errors = _validate_tags(tag_ids)

    if not valid_tag_ids:
        return AssignTagsToBoxesResult(
            updated_boxes=[],
            invalid_box_label_identifiers=[],
            tag_error_info=tag_errors,
        )

    label_identifiers = set(update_input["label_identifiers"])
    cursor = db.database.execute_sql(
        """\
WITH box_ids AS (
    -- Map the provided box label identifiers to their corresponding IDs
    SELECT s.id
    FROM stock s
    INNER JOIN locations l
    ON l.id = s.location_id
    WHERE s.box_id IN %s
    -- filter out deleted boxes
    AND (s.deleted IS NULL OR NOT s.deleted)
    -- filter out boxes in bases that user is not authorized for
    AND l.camp_id IN %s
),
tag_ids AS (
    SELECT id
    FROM tags
    WHERE id IN %s
),
box_tag_combinations AS (
    -- Generate all combinations of box IDs and tag IDs
    SELECT
        box_ids.id as box_id,
        tag_ids.id AS tag_id
    FROM box_ids CROSS JOIN tag_ids
),
existing_relations AS (
    -- Find existing box-to-tag assignments
    SELECT object_id AS box_id, tag_id
    FROM tags_relations
    WHERE object_type = "Stock" AND deleted_on IS NULL
),
missing_tags AS (
    -- Identify missing tags for each box
    SELECT
        btc.box_id,
        btc.tag_id
    FROM
        box_tag_combinations btc
    LEFT JOIN existing_relations er
        ON btc.box_id = er.box_id AND btc.tag_id = er.tag_id
    WHERE
        er.tag_id IS NULL
)
-- Aggregate the missing tags per box
SELECT
    s.box_id as label_identifier,
    s.id,
    GROUP_CONCAT(mt.tag_id) AS missing_tag_ids
FROM
    missing_tags mt
INNER JOIN stock s
    ON s.id = mt.box_id
GROUP BY
    mt.box_id;
        """,
        (
            label_identifiers,
            g.user.authorized_base_ids("stock:write"),
            valid_tag_ids,
        ),
    )
    column_names = [x[0] for x in cursor.description]
    valid_boxes = [dict(zip(column_names, row)) for row in cursor.fetchall()]

    valid_box_label_identifiers = {box["label_identifier"] for box in valid_boxes}

    return AssignTagsToBoxesResult(
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
    tag_id = update_input["tag_ids"][0]
    if (tag := Tag.get_or_none(tag_id)) is None:
        return ResourceDoesNotExist(name="Tag", id=tag_id)
    authorize(permission="tag_relation:assign")
    authorize(permission="tag:read", base_id=tag.base_id)
    if tag.deleted_on is not None:
        # When a tag is deleted, it is also unassigned from any resource, hence in
        # theory unassigning a deleted tag should not happen. However we have to deal
        # with legacy data (there are 1.3k boxes assigned to deleted tags) and want to
        # be notified about it.
        emit_sentry_message(
            "User unassigned deleted tag from boxes",
            level="warning",
            extras={"tag_id": tag_id},
        )
    if tag.type == TagType.Beneficiary:
        # When a tag type changes, it is also unassigned from any resource, hence in
        # theory boxes assigned with a Beneficiary tag should not occur. However we have
        # to deal with legacy data and want to be notified about it.
        emit_sentry_message(
            "User unassigned Beneficiary-type tag from boxes",
            level="warning",
            extras={"tag_id": tag_id},
        )

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
                & (TagsRelation.deleted_on.is_null())
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

    return BoxesResult(
        updated_boxes=unassign_tag_from_boxes(user_id=g.user.id, boxes=boxes, tag=tag),
        invalid_box_label_identifiers=sorted(
            label_identifiers.difference(valid_box_label_identifiers)
        ),
    )
