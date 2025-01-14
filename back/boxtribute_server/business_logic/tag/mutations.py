from ariadne import MutationType
from flask import g

from ...authz import authorize
from ...models.definitions.tag import Tag
from .crud import create_tag, delete_tag, update_tag

mutation = MutationType()


@mutation.field("createTag")
def resolve_create_tag(*_, creation_input):
    authorize(permission="tag:write", base_id=creation_input["base_id"])
    return create_tag(user_id=g.user.id, **creation_input)


@mutation.field("updateTag")
def resolve_update_tag(*_, update_input):
    tag = Tag.get_by_id(update_input["id"])
    authorize(permission="tag:write", base_id=tag.base_id)
    return update_tag(user_id=g.user.id, tag=tag, **update_input)


@mutation.field("deleteTag")
def resolve_delete_tag(*_, id):
    tag = Tag.get_by_id(id)
    authorize(permission="tag:write", base_id=tag.base_id)
    return delete_tag(user_id=g.user.id, tag=tag)
