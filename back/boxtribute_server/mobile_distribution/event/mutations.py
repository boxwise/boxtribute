from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ...authz import authorize
from ...models.definitions.location import Location
from ..crud import create_distribution_event

mutation = MutationType()


@mutation.field("createDistributionEvent")
@convert_kwargs_to_snake_case
def resolve_create_distribution_event(*_, creation_input):
    distribution_spot = Location.get_by_id(creation_input["distribution_spot_id"])
    authorize(permission="distro_event:write", base_id=distribution_spot.base_id)
    return create_distribution_event(user_id=g.user.id, **creation_input)
