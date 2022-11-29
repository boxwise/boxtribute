import random

import peewee

from ...db import db
from ...enums import BoxState, TaggableObjectType
from ...exceptions import BoxCreationFailed, NegativeNumberOfItems
from ...models.crud import assign_tag, unassign_tag
from ...models.definitions.box import Box
from ...models.definitions.location import Location
from ...models.definitions.qr_code import QrCode
from ...models.definitions.tags_relation import TagsRelation
from ...models.utils import save_creation_to_history, save_update_to_history, utcnow

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
                for tag_id in tag_ids or []:
                    assign_tag(
                        user_id=user_id,
                        id=tag_id,
                        resource_id=new_box.id,
                        resource_type=TaggableObjectType.Box,
                    )
                return new_box

        except peewee.IntegrityError as e:
            # peewee throws the same exception for different constraint violations.
            # E.g. failing "NOT NULL" constraint shall be directly reported
            if "Duplicate entry" not in str(e):
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

    box.last_modified_by = user_id
    box.last_modified_on = utcnow()
    box.save()
    return box
