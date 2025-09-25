import random
from decimal import Decimal

import peewee

from ....db import db
from ....enums import BoxState, TaggableObjectType
from ....exceptions import (
    BoxCreationFailed,
    DisplayUnitProductMismatch,
    IncompatibleSizeAndMeasureInput,
    InputFieldIsNotNone,
    LocationBaseMismatch,
    LocationTagBaseMismatch,
    MissingInputField,
    NegativeMeasureValue,
    NegativeNumberOfItems,
    ProductLocationBaseMismatch,
    QrCodeAlreadyAssignedToBox,
    TagBaseMismatch,
)
from ....models.definitions.box import Box
from ....models.definitions.history import DbChangeHistory
from ....models.definitions.location import Location
from ....models.definitions.product import Product
from ....models.definitions.qr_code import QrCode
from ....models.definitions.tag import Tag
from ....models.definitions.tags_relation import TagsRelation
from ....models.definitions.unit import Unit
from ....models.utils import (
    BATCH_SIZE,
    HISTORY_DELETION_MESSAGE,
    RANDOM_SEQUENCE_GENERATION_ATTEMPTS,
    convert_ids,
    save_creation_to_history,
    save_update_to_history,
    utcnow,
)


def is_measure_product(product):
    """Return True if the product's size range is either Mass or Volume, False
    otherwise.
    """
    return product.size_range_id in [28, 29]


def _validate_base_of_tags(*, tag_ids, location):
    if len(tag_ids) == 0:
        # Handle empty list when removing all assigned tags via updateBox
        return

    tag_base_ids = {t.base_id for t in Tag.select(Tag.base).where(Tag.id << tag_ids)}
    if len(tag_base_ids) > 1:
        # All requested tags must be registered in the same base
        raise TagBaseMismatch()

    tag_base_id = list(tag_base_ids)[0]
    if location.base_id != tag_base_id:
        raise LocationTagBaseMismatch()


@save_creation_to_history
def create_box(
    product_id,
    location_id,
    user_id,
    now,
    size_id=None,
    display_unit_id=None,
    measure_value=None,
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
    if number_of_items is not None and number_of_items < 0:
        raise NegativeNumberOfItems()

    product = (
        Product.select(Product.size_range, Product.base)
        .where(Product.id == product_id)
        .get()
    )
    location = (
        Location.select(Location.box_state, Location.base)
        .where(Location.id == location_id)
        .get()
    )
    if product.base_id != location.base_id:
        raise ProductLocationBaseMismatch()

    if tag_ids:
        _validate_base_of_tags(tag_ids=tag_ids, location=location)

    # The inputs size_id and the pair (display_unit_id, measure_value) are mutually
    # exclusive.
    if size_id is not None and display_unit_id is None and measure_value is None:
        pass  # valid input
    elif size_id is None and display_unit_id is not None and measure_value is not None:
        if measure_value < 0:
            raise NegativeMeasureValue()

        display_unit = Unit.get_by_id(display_unit_id)
        if display_unit.dimension_id != product.size_range_id:
            raise DisplayUnitProductMismatch()
    else:
        raise IncompatibleSizeAndMeasureInput()

    qr_id = QrCode.get_id_from_code(qr_code) if qr_code is not None else None

    box_state = (
        BoxState.InStock if location.box_state_id is None else location.box_state_id
    )

    for _ in range(RANDOM_SEQUENCE_GENERATION_ATTEMPTS):
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
            new_box.display_unit = display_unit_id

            if measure_value is not None:
                # Convert from display unit to dimensional base unit
                new_box.measure_value = (
                    Decimal(measure_value) / display_unit.conversion_factor
                )

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
                            "created_on": now,
                            "created_by": user_id,
                        }
                        for tag_id in set(tag_ids)
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
        Box.display_unit,
        Box.measure_value,
    ],
)
def update_box(
    label_identifier,
    user_id,
    now,
    comment=None,
    number_of_items=None,
    location_id=None,
    product_id=None,
    size_id=None,
    display_unit_id=None,
    measure_value=None,
    state=None,
    tag_ids=None,
    tag_ids_to_be_added=None,
):
    """Look up an existing Box given a UUID, and update all requested fields.
    Insert timestamp for modification and return the box.
    """
    box = Box.get(Box.label_identifier == label_identifier)
    box_contains_measure_product = box.size_id is None
    new_product = Product.get_by_id(product_id or box.product_id)
    new_product_is_measure_product = is_measure_product(new_product)
    old_location = Location.get_by_id(box.location_id)
    new_location = (
        Location.get_by_id(location_id) if location_id is not None else old_location
    )

    if old_location.base_id != new_location.base_id:
        raise LocationBaseMismatch()

    if new_product.base_id != new_location.base_id:
        raise ProductLocationBaseMismatch()

    if new_product_is_measure_product:
        if size_id is not None:
            raise InputFieldIsNotNone(field="sizeId")
    else:
        if display_unit_id is not None:
            raise InputFieldIsNotNone(field="displayUnitId")
        if measure_value is not None:
            raise InputFieldIsNotNone(field="measureValue")

    if box_contains_measure_product and not new_product_is_measure_product:
        # switch measure-product -> size-product
        if size_id is None:
            raise MissingInputField(field="sizeId")
        box.display_unit = None
        box.measure_value = None
    elif not box_contains_measure_product and new_product_is_measure_product:
        # switch size-product -> measure-product
        if measure_value is None:
            raise MissingInputField(field="measureValue")
        if display_unit_id is None:
            raise MissingInputField(field="displayUnitId")
        box.size = None

    display_unit = None
    # Validate AFTER possible switch of product type (reset of display_unit)
    if display_unit_id or box.display_unit_id:
        display_unit = Unit.get_by_id(display_unit_id or box.display_unit_id)
        if display_unit.dimension_id != new_product.size_range_id:
            raise DisplayUnitProductMismatch()

    if comment is not None:
        box.comment = comment
    if number_of_items is not None:
        if number_of_items < 0:
            raise NegativeNumberOfItems()
        box.number_of_items = number_of_items
    if location_id is not None:
        box.location = location_id
        box.state = (
            new_location.box_state_id
            if new_location.box_state_id is not None
            else box.state_id
        )
    if product_id is not None:
        box.product = product_id
    if size_id is not None:
        box.size = size_id
    if display_unit_id is not None:
        box.display_unit = display_unit_id
    if measure_value is not None:
        if measure_value < 0:
            raise NegativeMeasureValue()
        box.measure_value = Decimal(measure_value) / display_unit.conversion_factor
    if state is not None:
        box.state = state
    if tag_ids is not None:
        _validate_base_of_tags(tag_ids=tag_ids, location=new_location)

        # Find all tag IDs that are currently assigned to the box
        assigned_tag_ids = set(
            r.tag_id
            for r in TagsRelation.select(TagsRelation.tag_id).where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id == box.id,
                TagsRelation.deleted_on.is_null(),
            )
        )
        updated_tag_ids = set(tag_ids)

        # Unassign all tags that were previously assigned to the box but are not part
        # of the updated set of tags
        TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
            TagsRelation.tag << assigned_tag_ids.difference(updated_tag_ids),
            TagsRelation.object_id == box.id,
            TagsRelation.object_type == TaggableObjectType.Box,
            TagsRelation.deleted_on.is_null(),
        ).execute()

        # Assign all tags that are part of the updated set of tags but were previously
        # not assigned to the box
        tags_relations = [
            TagsRelation(
                object_id=box.id,
                object_type=TaggableObjectType.Box,
                tag=tag_id,
                created_on=now,
                created_by=user_id,
            )
            for tag_id in updated_tag_ids.difference(assigned_tag_ids)
        ]
        TagsRelation.bulk_create(tags_relations, batch_size=BATCH_SIZE)

        # If a tags update is the only effective change for updateBox, the
        # save_update_to_history function would not set the last_modified_* fields for
        # the box, hence we explicitly do it here. But only if the tags actually changed
        if assigned_tag_ids != updated_tag_ids:
            box.last_modified_on = now
            box.last_modified_by = user_id

    if tag_ids_to_be_added is not None:
        _validate_base_of_tags(tag_ids=tag_ids_to_be_added, location=new_location)

        # Find all tag IDs that are currently assigned to the box
        assigned_tag_ids = set(
            r.tag_id
            for r in TagsRelation.select(TagsRelation.tag_id).where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id == box.id,
                TagsRelation.deleted_on.is_null(),
            )
        )
        # Assign all tags that are part of the set of tags requested to be added but
        # were previously not assigned to the box
        tags_relations = [
            TagsRelation(
                object_id=box.id,
                object_type=TaggableObjectType.Box,
                tag=tag_id,
                created_on=now,
                created_by=user_id,
            )
            for tag_id in set(tag_ids_to_be_added).difference(assigned_tag_ids)
        ]
        TagsRelation.bulk_create(tags_relations, batch_size=BATCH_SIZE)

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
            changes=HISTORY_DELETION_MESSAGE,
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
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)

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
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)

    # Re-fetch updated box data because returning "boxes" would contain outdated objects
    # with the old location
    return list(Box.select().where(Box.id << box_ids))


def assign_missing_tags_to_boxes(*, user_id, boxes):
    """Add TagsRelation entries according to information in `boxes` (a list of tag IDs
    to be added per box). The tags must not be already assigned to the boxes.

    Update last_modified_* fields of the affected boxes.
    Return the list of updated boxes.
    """
    if not boxes:
        return []

    now = utcnow()
    tags_relations = [
        TagsRelation(
            object_id=box["id"],
            object_type=TaggableObjectType.Box,
            tag=tag_id,
            created_on=now,
            created_by=user_id,
        )
        for box in boxes
        for tag_id in convert_ids(box["missing_tag_ids"])
    ]

    box_ids = [box["id"] for box in boxes]
    with db.database.atomic():
        Box.update(last_modified_on=now, last_modified_by=user_id).where(
            Box.id << box_ids
        ).execute()
        TagsRelation.bulk_create(tags_relations, batch_size=BATCH_SIZE)

    return list(Box.select().where(Box.id << box_ids))


def unassign_tags_from_boxes(*, user_id, boxes, tag_ids):
    """Soft-delete TagsRelation rows containing the given boxes and tag IDs. Already
    deleted TagsRelations are ignored.

    Update last_modified_* fields of the affected boxes.
    Return the list of updated boxes.
    """
    if not boxes:
        return []

    box_ids = {box.id for box in boxes}
    now = utcnow()
    with db.database.atomic():
        Box.update(last_modified_on=now, last_modified_by=user_id).where(
            Box.id << box_ids
        ).execute()
        TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
            TagsRelation.tag << tag_ids,
            TagsRelation.object_id << box_ids,
            TagsRelation.object_type == TaggableObjectType.Box,
            TagsRelation.deleted_on.is_null(),
        ).execute()

    return list(Box.select().where(Box.id << box_ids))
