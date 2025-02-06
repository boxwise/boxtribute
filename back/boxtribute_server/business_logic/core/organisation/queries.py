from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.organisation import Organisation

query = QueryType()


@query.field("organisations")
def resolve_organisations(*_):
    authorize(permission="organisation:read")
    return Organisation.select().where(Organisation.deleted_on.is_null())


@query.field("organisation")
def resolve_organisation(*_, id):
    authorize(permission="organisation:read")
    return Organisation.get_by_id(id)
