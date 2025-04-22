from ariadne import MutationType
from flask import g

from ...authz import authorize, handle_unauthorized
from ...models.definitions.beneficiary import Beneficiary
from .crud import (
    create_beneficiaries,
    create_beneficiary,
    deactivate_beneficiary,
    update_beneficiary,
)

mutation = MutationType()


@mutation.field("createBeneficiary")
def resolve_create_beneficiary(*_, creation_input):
    authorize(permission="beneficiary:create", base_id=creation_input["base_id"])
    authorize(permission="tag:read", base_id=creation_input["base_id"])
    authorize(permission="beneficiary_language:assign")
    authorize(permission="tag_relation:assign")
    return create_beneficiary(**creation_input, user_id=g.user.id)


@mutation.field("createBeneficiaries")
@handle_unauthorized
def resolve_create_beneficiaries(*_, creation_input):
    authorize(permission="beneficiary:create", base_id=creation_input["base_id"])
    authorize(permission="tag:read", base_id=creation_input["base_id"])
    authorize(permission="beneficiary_language:assign")
    authorize(permission="tag_relation:assign")
    return create_beneficiaries(**creation_input, user_id=g.user.id)


@mutation.field("updateBeneficiary")
def resolve_update_beneficiary(*_, update_input):
    beneficiary = Beneficiary.get_by_id(update_input["id"])
    authorize(permission="beneficiary:edit", base_id=beneficiary.base_id)
    authorize(permission="tag:read", base_id=beneficiary.base_id)
    authorize(permission="beneficiary_language:assign")
    authorize(permission="tag_relation:assign")
    return update_beneficiary(
        **update_input, beneficiary=beneficiary, user_id=g.user.id
    )


@mutation.field("deactivateBeneficiary")
def resolve_deactivate_beneficiary(*_, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(permission="beneficiary:delete", base_id=beneficiary.base_id)
    return deactivate_beneficiary(beneficiary=beneficiary)
