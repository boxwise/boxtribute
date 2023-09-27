from ariadne import MutationType
from flask import g

from ...authz import authorize
from ...models.definitions.tag import Tag
from .crud import assign_tag, create_tag, delete_tag, unassign_tag, update_tag

mutation = MutationType()


@mutation.field("createTag")
def resolve_create_tag(*_, creation_input):
    authorize(permission="tag:write", base_id=creation_input["base_id"])
    return create_tag(user_id=g.user.id, **creation_input)


@mutation.field("updateTag")
def resolve_update_tag(*_, update_input):
    base_id = Tag.get_by_id(update_input["id"]).base_id
    authorize(permission="tag:write", base_id=base_id)
    return update_tag(user_id=g.user.id, **update_input)


@mutation.field("assignTag")
def resolve_assign_tag(*_, assignment_input):
    tag = Tag.get_by_id(assignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return assign_tag(user_id=g.user.id, **assignment_input)


@mutation.field("unassignTag")
def resolve_unassign_tag(*_, unassignment_input):
    tag = Tag.get_by_id(unassignment_input["id"])
    authorize(permission="tag_relation:assign", base_id=tag.base_id)
    return unassign_tag(user_id=g.user.id, **unassignment_input)


@mutation.field("deleteTag")
def resolve_delete_tag(*_, id):
    base_id = Tag.get_by_id(id).base_id
    authorize(permission="tag:write", base_id=base_id)
    return delete_tag(user_id=g.user.id, id=id)
