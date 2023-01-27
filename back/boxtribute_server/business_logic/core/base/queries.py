from ariadne import QueryType

from ....authz import authorize, authorized_bases_filter
from ....models.definitions.base import Base

query = QueryType()


@query.field("bases")
def resolve_bases(*_):
    return Base.select().where(authorized_bases_filter())


@query.field("base")
def resolve_base(*_, id):
    authorize(permission="base:read", base_id=int(id))
    return Base.get_by_id(id)
