from ariadne import MutationType
from flask import g

from ....authz import authorize
from ....models.definitions.base import Base
from .crud import create_custom_product

mutation = MutationType()


@mutation.field("createCustomProduct")
def resolve_create_custom_product(*_, creation_input):
    # Base might not exist
    base = Base.get_by_id(creation_input["base_id"])
    # permission might be missing; or not granted for this base
    authorize(permission="product:write", base_id=base.id)

    return create_custom_product(user_id=g.user.id, **creation_input)
