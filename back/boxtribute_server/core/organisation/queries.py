from ariadne import QueryType

from ...models.definitions.organisation import Organisation

query = QueryType()


@query.field("organisations")
def resolve_organisations(*_):
    return Organisation.select()


@query.field("organisation")
def resolve_organisation(*_, id):
    return Organisation.get_by_id(id)
