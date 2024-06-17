import random

import peewee

from ....db import db
from ....enums import BoxState, TaggableObjectType
from ....exceptions import (
    BoxCreationFailed,
    NegativeNumberOfItems,
    QrCodeAlreadyAssignedToBox,
)
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.location import Location
from ....models.definitions.qr_code import QrCode
from ....models.definitions.tags_relation import TagsRelation
from ....models.utils import save_creation_to_history, save_update_to_history, utcnow
from ...tag.crud import assign_tag, unassign_tag

BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS = 10


@save_creation_to_history
def create_box(
    product_id,
    location_id,
    user_id,
    size_id,
    comment="",
    number_of_items=None,
    qr_code=None,
    tag_ids=None,
):
    """Insert information for a new Box in the database. Use current datetime
    and box state "InStock" by default. If a location with a box state is passed
    use its box state for the new box. Generate an 8-digit sequence to identify the
    box. If the sequence is not unique, repeat the generation several times. If
    generation still fails, raise a BoxCreationFailed exception.
    Assign any given tags to the newly created box.
    """

    now = utcnow()
    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    location_box_state_id = Location.get_by_id(location_id).box_state_id
    box_state = (
        BoxState.InStock if location_box_state_id is None else location_box_state_id
    )
    if number_of_items is not None and number_of_items < 0:
        raise NegativeNumberOfItems()

    for i in range(BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS):
        try:
            new_box = Box()
            new_box.comment = comment
            new_box.created_on = now
            new_box.created_by = user_id
            new_box.number_of_items = number_of_items
            new_box.label_identifier = "".join(random.choices("0123456789", k=8))
            new_box.last_modified_on = now
            new_box.last_modified_by = user_id
            new_box.location = location_id
            new_box.product = product_id
            new_box.size = size_id
            new_box.state = box_state
            new_box.qr_code = qr_id

            with db.database.atomic():
                new_box.save()

                if tag_ids:
                    # Don't use assign_tag() because it requires an existing Box object,
                    # however the Box creation has not yet been committed to the DB
                    tags_relations = [
                        {
                            "object_id": new_box.id,
                            "object_type": TaggableObjectType.Box,
                            "tag": tag_id,
                        }
                        for tag_id in tag_ids
                    ]
                    TagsRelation.insert_many(tags_relations).execute()
                return new_box

        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            prefix = "Duplicate entry"
            error = str(e)
            if f"{prefix} '{qr_id}'" in error and "qr_id_unique" in error:
                raise QrCodeAlreadyAssignedToBox()
            if (
                f"{prefix} '{new_box.label_identifier}'" not in error
                and "box_id_unique" not in error
            ):
                raise
    raise BoxCreationFailed()


@save_update_to_history(
    id_field_name="label_identifier",
    fields=[
        Box.label_identifier,
        Box.product,
        Box.size,
        Box.number_of_items,
        Box.location,
        Box.comment,
        Box.state,
    ],
)
def update_box(
    label_identifier,
    user_id,
    comment=None,
    number_of_items=None,
    location_id=None,
    product_id=None,
    size_id=None,
    state=None,
    tag_ids=None,
    tag_ids_to_be_added=None,
):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box = Box.get(Box.label_identifier == label_identifier)

    if comment is not None:
        box.comment = comment
    if number_of_items is not None:
        if number_of_items < 0:
            raise NegativeNumberOfItems()
        box.number_of_items = number_of_items
    if location_id is not None:
        box.location = location_id
        location_box_state_id = Location.get_by_id(location_id).box_state_id
        box.state = (
            location_box_state_id if location_box_state_id is not None else box.state_id
        )
    if product_id is not None:
        box.product = product_id
    if size_id is not None:
        box.size = size_id
    if state is not None:
        box.state = state
    if tag_ids is not None:
        # Find all tag IDs that are currently assigned to the box
        assigned_tag_ids = set(
            r.tag_id
            for r in TagsRelation.select(TagsRelation.tag_id).where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id == box.id,
            )
        )
        updated_tag_ids = set(tag_ids)

        # Unassign all tags that were previously assigned to the box but are not part
        # of the updated set of tags
        for tag_id in assigned_tag_ids.difference(updated_tag_ids):
            unassign_tag(
                user_id=user_id,
                id=tag_id,
                resource_id=box.id,
                resource_type=TaggableObjectType.Box,
            )
        # Assign all tags that are part of the updated set of tags but were previously
        # not assigned to the box
        for tag_id in updated_tag_ids.difference(assigned_tag_ids):
            assign_tag(
                user_id=user_id,
                id=tag_id,
                resource_id=box.id,
                resource_type=TaggableObjectType.Box,
            )

    if tag_ids_to_be_added is not None:
        # Find all tag IDs that are currently assigned to the box
        assigned_tag_ids = set(
            r.tag_id
            for r in TagsRelation.select(TagsRelation.tag_id).where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id == box.id,
            )
        )
        # Assign all tags that are part of the set of tags requested to be added but
        # were previously not assigned to the box
        for tag_id in set(tag_ids_to_be_added).difference(assigned_tag_ids):
            assign_tag(
                user_id=user_id,
                id=tag_id,
                resource_id=box.id,
                resource_type=TaggableObjectType.Box,
            )

    return box


def delete_boxes(*, user_id, boxes):
    """Soft-delete given boxes by setting the `deleted_on` field. Log every box deletion
    in the history table.
    Return the list of soft-deleted boxes.
    """
    if not boxes:
        # bulk_create() fails with an empty list, hence return immediately. Happens if
        # all boxes requested for deletion are prohibited for the user, non-existing,
        # and/or already deleted.
        return []

    now = utcnow()
    history_entries = [
        DbChangeHistory(
            changes="Record deleted",
            table_name=Box._meta.table_name,
            record_id=box.id,
            user=user_id,
            change_date=now,
        )
        for box in boxes
    ]

    box_ids = [box.id for box in boxes]
    with db.database.atomic():
        Box.update(deleted_on=now).where(Box.id << box_ids).execute()
        DbChangeHistory.bulk_create(history_entries)

    # Re-fetch updated box data because returning "boxes" would contain outdated objects
    # with the unset deleted_on field
    return list(Box.select().where(Box.id << box_ids))


def move_boxes_to_location(*, user_id, boxes, location):
    """Update location and last_modified_* fields of the given boxes. If the new
    location has a default box state assigned, change given boxes' state. Log every
    location (and state) change in the history table.
    Return the list of updated boxes.
    """
    if not boxes:
        return []

    now = utcnow()
    updated_fields = dict(
        location=location.id, last_modified_on=now, last_modified_by=user_id
    )
    history_entries = [
        DbChangeHistory(
            changes=Box.location.column_name,
            table_name=Box._meta.table_name,
            record_id=box.id,
            user=user_id,
            change_date=now,
            from_int=box.location_id,
            to_int=location.id,
        )
        for box in boxes
        if box.location_id != location.id
    ]

    if location.box_state_id is not None:
        updated_fields["state"] = location.box_state_id
        history_entries.extend(
            [
                DbChangeHistory(
                    changes=Box.state.column_name,
                    table_name=Box._meta.table_name,
                    record_id=box.id,
                    user=user_id,
                    change_date=now,
                    from_int=box.state_id,
                    to_int=location.box_state_id,
                )
                for box in boxes
                if box.state_id != location.box_state_id
            ]
        )

    box_ids = [box.id for box in boxes]
    with db.database.atomic():
        # Using Box.update(...).where(...) is better than Box.bulk_update() because the
        # latter results in the less performant SQL
        #   UPDATE stock SET location_id = CASE stock.id
        #       WHEN 1 THEN 1
        #       WHEN 2 THEN 1
        #       ... END
        #   WHERE stock.id in (1, 2, ...);
        # cf. https://docs.peewee-orm.com/en/latest/peewee/querying.html#alternatives
        Box.update(**updated_fields).where(Box.id << box_ids).execute()
        DbChangeHistory.bulk_create(history_entries)

    # Re-fetch updated box data because returning "boxes" would contain outdated objects
    # with the old location
    return list(Box.select().where(Box.id << box_ids))


def assign_tag_to_boxes(*, user_id, boxes, tag):
    """Add TagsRelation entries for given boxes and tag. Update last_modified_* fields
    of the affected boxes.
    Return the list of updated boxes.
    """
    if not boxes:
        return []

    tags_relations = [
        {
            "object_id": box.id,
            "object_type": TaggableObjectType.Box,
            "tag": tag.id,
        }
        for box in boxes
    ]

    box_ids = [box.id for box in boxes]
    with db.database.atomic():
        Box.update(last_modified_on=utcnow(), last_modified_by=user_id).where(
            Box.id << box_ids
        ).execute()
        TagsRelation.insert_many(tags_relations).execute()

    # Skip re-fetching box data (last_modified_* fields will be outdated in response)
    return boxes


def unassign_tag_from_boxes(*, user_id, boxes, tag):
    """Remove TagsRelation rows containing the given tag. Update last_modified_* fields
    of the affected boxes.
    Return the list of updated boxes.
    """
    if not boxes:
        return []

    box_ids = [box.id for box in boxes]
    with db.database.atomic():
        Box.update(last_modified_on=utcnow(), last_modified_by=user_id).where(
            Box.id << box_ids
        ).execute()
        TagsRelation.delete().where(
            TagsRelation.tag == tag.id,
            TagsRelation.object_id << box_ids,
            TagsRelation.object_type == TaggableObjectType.Box,
        ).execute()

    # Skip re-fetching box data (last_modified_* fields will be outdated in response)
    return boxes
