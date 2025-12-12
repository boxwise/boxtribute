import random
import re

from peewee import JOIN

from ...db import db
from ...enums import TaggableObjectType, TagType
from ...errors import DeletedTag, EmptyName, InvalidColor
from ...exceptions import IncompatibleTagTypeAndResourceType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.utils import (
    BATCH_SIZE,
    HISTORY_DELETION_MESSAGE,
    handle_non_existing_resource,
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
    utcnow,
)


def _is_valid_hex_color(color):
    """Validate if a string is a valid hex color code (e.g., #RRGGBB or #RGB)."""
    if not color:
        return False
    # Match #RGB or #RRGGBB format
    pattern = r"^#(?:[0-9a-fA-F]{3}){1,2}$"
    return bool(re.match(pattern, color))


@save_creation_to_history
@handle_non_existing_resource
def create_tag(
    *,
    name,
    description="",
    color=None,
    type,
    user_id,
    base_id,
    now,
):
    """Insert information for a new Tag in the database."""
    if color is None:
        color = f"#{random.randint(0, 0xFFFFFF):06x}"
    elif not _is_valid_hex_color(color):
        return InvalidColor(color=color)

    return Tag.create(
        color=color,
        created_on=now,
        created_by=user_id,
        description=description,
        name=name,
        type=type,
        base=base_id,
    )


@handle_non_existing_resource
@save_update_to_history(
    fields=[
        Tag.name,
        Tag.description,
        Tag.color,
        Tag.type,
    ],
)
def update_tag(
    *,
    id,  # required for save_update_to_history
    tag,
    name=None,
    description=None,
    color=None,
    type=None,
    user_id,
    now,
):
    """Look up an existing Tag given an ID, and update all requested fields.
    If the tag type is changed from All/Beneficiary to Box, remove the tag from all
    beneficiaries that had it assigned before (vice versa when changing tag type from
    All/Box to Beneficiary).
    Insert timestamp for modification and return the tag.
    """
    if tag.deleted_on is not None:
        return DeletedTag(name=tag.name)

    if name is not None:
        if not name:
            return EmptyName()
        tag.name = name
    if description is not None:
        tag.description = description
    if color is not None:
        if not _is_valid_hex_color(color):
            return InvalidColor(color=color)
        tag.color = color

    object_type_for_deletion = None
    # Skip tags-relation modification if type does not change
    if type is not None and type != tag.type:
        if type == TagType.Box:
            object_type_for_deletion = TaggableObjectType.Beneficiary
        elif type == TagType.Beneficiary:
            object_type_for_deletion = TaggableObjectType.Box
        tag.type = type

    with db.database.atomic():
        if object_type_for_deletion is not None:
            TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
                TagsRelation.object_type == object_type_for_deletion,
                TagsRelation.tag == id,
                TagsRelation.deleted_on.is_null(),
            ).execute()
    return tag


@safely_handle_deletion
@handle_non_existing_resource
def delete_tag(*, user_id, tag, now):
    """Soft-delete given tag. Unassign the tag from any resources by soft-deleting
    respective rows of the TagsRelation model.
    """
    TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
        TagsRelation.tag == tag.id,
        TagsRelation.deleted_on.is_null(),
    ).execute()
    return tag


def delete_tags(*, user_id, tags):
    """Soft-delete a collection of tags. Unassign the tags from any resources by
    soft-deleting respective rows of the TagsRelation model.
    Return list of updated tags.
    """
    now = utcnow()
    history_entries = [
        DbChangeHistory(
            changes=HISTORY_DELETION_MESSAGE,
            table_name=Tag._meta.table_name,
            record_id=tag.id,
            user=user_id,
            change_date=now,
        )
        for tag in tags
    ]

    tag_ids = [tag.id for tag in tags]

    with db.database.atomic():
        TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
            TagsRelation.tag << tag_ids,
            TagsRelation.deleted_on.is_null(),
        ).execute()

        Tag.update(deleted_on=now).where(Tag.id << tag_ids).execute()
        DbChangeHistory.bulk_create(history_entries, batch_size=BATCH_SIZE)

    # Re-fetch tags to return updated objects
    return list(Tag.select().where(Tag.id << tag_ids))


def assign_tag(*, user_id, id, resource_id, resource_type, tag=None):
    """Create TagsRelation entry as cross reference of the tag given by ID, and the
    given resource (a box or a beneficiary). Insert timestamp for modification in
    resource model.
    Validate that tag type and resource type are compatible.
    If the requested tag is already assigned to the resource, return the unmodified
    resource immediately.
    Return the resource.
    """
    tag = Tag.get_by_id(id) if tag is None else tag
    if (
        (tag.type == TagType.Beneficiary) and (resource_type == TaggableObjectType.Box)
    ) or (
        (tag.type == TagType.Box) and (resource_type == TaggableObjectType.Beneficiary)
    ):
        raise IncompatibleTagTypeAndResourceType(tag=tag, resource_type=resource_type)

    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = (
        model.select(model, TagsRelation.tag)
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            on=(
                (TagsRelation.object_id == model.id)
                & (TagsRelation.object_type == resource_type)
                & (TagsRelation.tag == tag.id)
                & TagsRelation.deleted_on.is_null()
            ),
        )
        .where(model.id == resource_id)
        .objects()  # make .tag a direct attribute of resource
        .get()
    )
    if resource.tag is not None:
        return resource

    now = utcnow()
    resource.last_modified_by = user_id
    resource.last_modified_on = now

    with db.database.atomic():
        TagsRelation.create(
            object_id=resource_id,
            object_type=resource_type,
            tag=id,
            created_on=now,
            created_by=user_id,
        )
        resource.save()
    return resource


def unassign_tag(*, user_id, id, resource_id, resource_type):
    """Soft-delete TagsRelation entry defined by given tag ID, resource ID, and resource
    type. Insert timestamp for modification in resource model.
    Return the resource that the tag was unassigned from.
    """
    now = utcnow()
    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = model.get_by_id(resource_id)
    resource.last_modified_by = user_id
    resource.last_modified_on = now

    with db.database.atomic():
        TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
            TagsRelation.tag == id,
            TagsRelation.object_id == resource_id,
            TagsRelation.object_type == resource_type,
            TagsRelation.deleted_on.is_null(),
        ).execute()
        resource.save()
    return resource
