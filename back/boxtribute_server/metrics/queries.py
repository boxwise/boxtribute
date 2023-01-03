from ariadne import QueryType, convert_kwargs_to_snake_case
from flask import g

from ..authz import authorize

query = QueryType()


@query.field("metrics")
@convert_kwargs_to_snake_case
def resolve_metrics(*_, organisation_id=None):
    # Default to current user's organisation ID
    organisation_id = organisation_id or g.user.organisation_id
    # Non-god users are only permitted to fetch their organisation's metrics, the god
    # user however can access any organisation's metrics
    authorize(organisation_id=organisation_id)

    # Pass organisation ID to child resolvers
    return {"organisation_id": organisation_id}
