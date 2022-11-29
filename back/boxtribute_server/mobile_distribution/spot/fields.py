from ariadne import ObjectType

from ...authz import authorize
from ...models.definitions.distribution_event import DistributionEvent

distribution_spot = ObjectType("DistributionSpot")


@distribution_spot.field("distributionEvents")
def resolve_distribution_spot_distribution_events(obj, _):
    authorize(permission="distro_event:read", base_id=obj.base_id)
    return DistributionEvent.select().where(
        DistributionEvent.distribution_spot == obj.id
    )
