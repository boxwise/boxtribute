from ariadne import MutationType
from flask import g

from ....authz import authorize
from ....models.definitions.location import Location
from ..crud import create_distribution_event

mutation = MutationType()


@mutation.field("createDistributionEvent")
def resolve_create_distribution_event(*_, creation_input):
    distribution_spot = Location.get_by_id(creation_input["distribution_spot_id"])
    authorize(permission="distro_event:write", base_id=distribution_spot.base_id)
    return create_distribution_event(user_id=g.user.id, **creation_input)
