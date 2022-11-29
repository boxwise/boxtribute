from ariadne import QueryType

from ...authz import authorize, authorized_bases_filter
from ...enums import LocationType
from ...models.definitions.location import Location

query = QueryType()


@query.field("distributionSpots")
def resolve_distributions_spots(base_obj, _):
    return Location.select().where(
        Location.type == LocationType.DistributionSpot,
        authorized_bases_filter(Location),
    )


@query.field("distributionSpot")
def resolve_distributions_spot(*_, id):
    distribution_spot = Location.get_by_id(id)
    if distribution_spot.type == LocationType.DistributionSpot:
        authorize(permission="location:read", base_id=distribution_spot.base_id)
        return distribution_spot
