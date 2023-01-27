from ariadne import QueryType

from ....authz import authorize
from ....models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)

query = QueryType()


@query.field("distributionEventsTrackingGroup")
def resolve_distribution_events_tracking_group(*_, id):
    tracking_group = DistributionEventsTrackingGroup.get_by_id(id)
    authorize(permission="distro_event:read", base_id=tracking_group.base_id)
    return tracking_group
