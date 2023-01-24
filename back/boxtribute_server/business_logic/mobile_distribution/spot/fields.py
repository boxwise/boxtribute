from ariadne import ObjectType

from ....authz import authorize
from ....models.definitions.distribution_event import DistributionEvent

distribution_spot = ObjectType("DistributionSpot")


@distribution_spot.field("distributionEvents")
def resolve_distribution_spot_distribution_events(spot_obj, _):
    authorize(permission="distro_event:read", base_id=spot_obj.base_id)
    return DistributionEvent.select().where(
        DistributionEvent.distribution_spot == spot_obj.id
    )


@distribution_spot.field("base")
def resolve_resource_base(spot_obj, _):
    authorize(permission="base:read", base_id=spot_obj.base_id)
    return spot_obj.base
