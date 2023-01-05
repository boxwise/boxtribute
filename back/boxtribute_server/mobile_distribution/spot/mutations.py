from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ...authz import authorize
from ..crud import create_distribution_spot

mutation = MutationType()


@mutation.field("createDistributionSpot")
@convert_kwargs_to_snake_case
def resolve_create_distribution_spot(*_, creation_input):
    authorize(permission="location:write", base_id=creation_input["base_id"])
    return create_distribution_spot(user_id=g.user.id, **creation_input)
