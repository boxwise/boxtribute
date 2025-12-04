from dataclasses import dataclass

from ariadne import MutationType
from flask import g

from ...authz import authorize, authorized_bases_filter, handle_unauthorized
from ...errors import ResourceDoesNotExist
from ...models.definitions.tag import Tag
from .crud import (
    assign_tag,
    create_tag,
    delete_tag,
    delete_tags,
    unassign_tag,
    update_tag,
)

mutation = MutationType()


@dataclass(kw_only=True)
class TagsResult:
    updated_tags: list[Tag]
    invalid_tag_ids: list[int]


@mutation.field("createTag")
@handle_unauthorized
def resolve_create_tag(*_, creation_input):
    authorize(permission="tag:write", base_id=creation_input["base_id"])
    return create_tag(user_id=g.user.id, **creation_input)


@mutation.field("updateTag")
@handle_unauthorized
def resolve_update_tag(*_, update_input):
    id = int(update_input["id"])
    if (tag := Tag.get_or_none(id)) is None:
        return ResourceDoesNotExist(name="Tag", id=id)
    authorize(permission="tag:write", base_id=tag.base_id)
    return update_tag(user_id=g.user.id, tag=tag, **update_input)


@mutation.field("assignTag")
def resolve_assign_tag(*_, assignment_input):
    tag = Tag.get_by_id(assignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return assign_tag(user_id=g.user.id, tag=tag, **assignment_input)


@mutation.field("unassignTag")
def resolve_unassign_tag(*_, unassignment_input):
    tag = Tag.get_by_id(unassignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return unassign_tag(user_id=g.user.id, **unassignment_input)


@mutation.field("deleteTag")
@handle_unauthorized
def resolve_delete_tag(*_, id):
    if (tag := Tag.get_or_none(int(id))) is None:
        return ResourceDoesNotExist(name="Tag", id=id)
    authorize(permission="tag:write", base_id=tag.base_id)
    if tag.deleted_on is not None:
        # If already deleted, return tag without updating the deleted_on field, nor
        # creating a history entry
        return tag
    return delete_tag(user_id=g.user.id, tag=tag)


@mutation.field("deleteTags")
@handle_unauthorized
def resolve_delete_tags(*_, ids):
    ids = set(ids)
    tags = (
        Tag.select()
        .where(
            Tag.id << ids,
            authorized_bases_filter(Tag, permission="tag:write"),
            (~Tag.deleted_on | Tag.deleted_on.is_null()),
        )
        .order_by(Tag.id)
    )
    valid_tag_ids = {tag.id for tag in tags}

    return TagsResult(
        updated_tags=delete_tags(user_id=g.user.id, tags=tags),
        invalid_tag_ids=sorted(ids.difference(valid_tag_ids)),
    )
