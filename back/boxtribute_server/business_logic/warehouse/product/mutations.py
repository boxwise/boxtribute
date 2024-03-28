from ariadne import MutationType
from flask import g

from ....authz import authorize
from ....errors import ResourceDoesNotExist
from ....models.definitions.base import Base
from .crud import create_custom_product

mutation = MutationType()


@mutation.field("createCustomProduct")
def resolve_create_custom_product(*_, creation_input):
    try:
        input_base_id = creation_input["base_id"]
        base_id = Base.select(Base.id).where(Base.id == input_base_id).get().id
    except Base.DoesNotExist:
        return ResourceDoesNotExist(name="Base", id=input_base_id)

    # permission might be missing; or not granted for this base
    authorize(permission="product:write", base_id=base_id)

    return create_custom_product(user_id=g.user.id, **creation_input)
