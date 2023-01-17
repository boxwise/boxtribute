from ariadne import QueryType

from ....authz import authorize, authorized_bases_filter
from ....enums import LocationType
from ....models.definitions.location import Location

query = QueryType()


@query.field("location")
def resolve_location(*_, id):
    location = Location.get_by_id(id)
    if location.type == LocationType.ClassicLocation:
        authorize(permission="location:read", base_id=location.base_id)
        return location


@query.field("locations")
def resolve_locations(*_):
    return Location.select().where(
        Location.type == LocationType.ClassicLocation,
        authorized_bases_filter(Location),
    )
