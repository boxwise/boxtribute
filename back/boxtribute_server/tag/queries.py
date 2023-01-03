from ariadne import QueryType

from ..authz import authorize, authorized_bases_filter
from ..models.definitions.tag import Tag

query = QueryType()


@query.field("tag")
def resolve_tag(*_, id):
    tag = Tag.get_by_id(id)
    authorize(permission="tag:read", base_id=tag.base_id)
    return tag


@query.field("tags")
def resolve_tags(*_):
    return Tag.select().where(Tag.deleted.is_null() & authorized_bases_filter(Tag))
