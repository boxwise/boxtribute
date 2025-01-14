from ...db import db
from ...enums import TaggableObjectType, TagType
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.utils import (
    safely_handle_deletion,
    save_creation_to_history,
    save_update_to_history,
)


@save_creation_to_history
def create_tag(
    *,
    name,
    description="",
    color,
    type,
    user_id,
    base_id,
    now,
):
    """Insert information for a new Tag in the database."""
    return Tag.create(
        color=color,
        created=now,
        created_by=user_id,
        description=description,
        name=name,
        modified=now,
        modified_by=user_id,
        type=type,
        base=base_id,
    )


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
    if name is not None:
        tag.name = name
    if description is not None:
        tag.description = description
    if color is not None:
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
def delete_tag(*, user_id, tag, now):
    """Soft-delete given tag. Unassign the tag from any resources by soft-deleting
    respective rows of the TagsRelation model.
    """
    TagsRelation.update(deleted_on=now, deleted_by=user_id).where(
        TagsRelation.tag == tag.id,
        TagsRelation.deleted_on.is_null(),
    ).execute()
    return tag
