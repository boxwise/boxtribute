from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.distribution_event import DistributionEvent

query = QueryType()


@query.field("distributionEvent")
def resolve_distribution_event(*_, id):
    distribution_event = DistributionEvent.get_by_id(id)
    authorize(
        permission="distro_event:read",
        base_id=distribution_event.distribution_spot.base_id,
    )
    return distribution_event
