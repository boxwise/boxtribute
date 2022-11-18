from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ..authz import authorize
from ..models.definitions.beneficiary import Beneficiary
from .crud import create_beneficiary, update_beneficiary

mutation = MutationType()


@mutation.field("createBeneficiary")
@convert_kwargs_to_snake_case
def resolve_create_beneficiary(*_, creation_input):
    authorize(permission="beneficiary:create", base_id=creation_input["base_id"])
    return create_beneficiary(**creation_input, user=g.user)


@mutation.field("updateBeneficiary")
@convert_kwargs_to_snake_case
def resolve_update_beneficiary(*_, update_input):
    beneficiary = Beneficiary.get_by_id(update_input["id"])
    authorize(permission="beneficiary:edit", base_id=beneficiary.base_id)
    return update_beneficiary(**update_input, user=g.user)
