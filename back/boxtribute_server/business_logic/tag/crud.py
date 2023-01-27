from ...db import db
from ...enums import TaggableObjectType, TagType
from ...exceptions import IncompatibleTagTypeAndResourceType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.utils import utcnow


def create_tag(
    *,
    name,
    description="",
    color,
    type,
    user_id,
    base_id,
):
    """Insert information for a new Tag in the database."""
    now = utcnow()
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


def update_tag(
    *,
    id,
    name=None,
    description=None,
    color=None,
    type=None,
    user_id,
):
    """Look up an existing Tag given an ID, and update all requested fields.
    If the tag type is changed from All/Beneficiary to Box, remove the tag from all
    beneficiaries that had it assigned before (vice versa when changing tag type from
    All/Box to Beneficiary).
    Insert timestamp for modification and return the tag.
    """
    tag = Tag.get_by_id(id)

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

    tag.modified = utcnow()
    tag.modified_by = user_id

    with db.database.atomic():
        tag.save()
        if object_type_for_deletion is not None:
            TagsRelation.delete().where(
                (TagsRelation.object_type == object_type_for_deletion)
                & (TagsRelation.tag == id)
            ).execute()
    return tag


def delete_tag(*, user_id, id):
    """Soft-delete given tag by setting the 'deleted' timestamp. Unassign the tag from
    any resources by deleting respective rows of the TagsRelation model.
    Return the soft-deleted tag.
    """
    now = utcnow()
    tag = Tag.get_by_id(id)
    tag.deleted = now
    tag.modified = now
    tag.modified_by = user_id
    with db.database.atomic():
        tag.save()
        TagsRelation.delete().where(TagsRelation.tag == id).execute()
    return tag


def assign_tag(*, user_id, id, resource_id, resource_type):
    """Create TagsRelation entry as cross reference of the tag given by ID, and the
    given resource (a box or a beneficiary). Insert timestamp for modification in
    resource model.
    Validate that tag type and resource type are compatible.
    Return the resource.
    """
    tag = Tag.get_by_id(id)
    if (
        (tag.type == TagType.Beneficiary) and (resource_type == TaggableObjectType.Box)
    ) or (
        (tag.type == TagType.Box) and (resource_type == TaggableObjectType.Beneficiary)
    ):
        raise IncompatibleTagTypeAndResourceType(tag=tag, resource_type=resource_type)

    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = model.get_by_id(resource_id)
    resource.last_modified_by = user_id
    resource.last_modified_on = utcnow()

    with db.database.atomic():
        TagsRelation.create(
            object_id=resource_id,
            object_type=resource_type,
            tag=id,
        )
        resource.save()
    return resource


def unassign_tag(*, user_id, id, resource_id, resource_type):
    """Delete TagsRelation entry defined by given tag ID, resource ID, and resource
    type. Insert timestamp for modification in resource model.
    Return the resource that the tag was unassigned from.
    """
    model = Box if resource_type == TaggableObjectType.Box else Beneficiary
    resource = model.get_by_id(resource_id)
    resource.last_modified_by = user_id
    resource.last_modified_on = utcnow()

    with db.database.atomic():
        TagsRelation.delete().where(
            TagsRelation.tag == id,
            TagsRelation.object_id == resource_id,
            TagsRelation.object_type == resource_type,
        ).execute()
        resource.save()
    return resource
