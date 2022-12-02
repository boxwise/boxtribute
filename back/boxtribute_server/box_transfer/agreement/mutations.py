from ariadne import MutationType, convert_kwargs_to_snake_case
from flask import g

from ...authz import authorize
from ...models.definitions.base import Base
from ...models.definitions.transfer_agreement import TransferAgreement
from .crud import (
    accept_transfer_agreement,
    cancel_transfer_agreement,
    create_transfer_agreement,
    reject_transfer_agreement,
    retrieve_transfer_agreement_bases,
)

mutation = MutationType()


@mutation.field("createTransferAgreement")
@convert_kwargs_to_snake_case
def resolve_create_transfer_agreement(*_, creation_input):
    # Enforce that the user can access at least one of the specified source bases
    # (default: all bases of the user's organisation)
    base_ids = creation_input.get(
        "source_base_ids",
        [
            b.id
            for b in Base.select().where(Base.organisation == g.user.organisation_id)
        ],
    )
    authorize(permission="transfer_agreement:create", base_ids=base_ids)
    return create_transfer_agreement(**creation_input, user=g.user)


@mutation.field("acceptTransferAgreement")
def resolve_accept_transfer_agreement(*_, id):
    # User must be member of at least one of the target bases to be authorized for
    # accepting the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    )
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(organisation_id=agreement.target_organisation_id)
    return accept_transfer_agreement(id=id, user=g.user)


@mutation.field("rejectTransferAgreement")
def resolve_reject_transfer_agreement(*_, id):
    # User must be member of at least one of the target bases to be authorized for
    # rejecting the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    )
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(organisation_id=agreement.target_organisation_id)
    return reject_transfer_agreement(id=id, user=g.user)


@mutation.field("cancelTransferAgreement")
def resolve_cancel_transfer_agreement(*_, id):
    # User must be member of at least one of the source or target bases to be authorized
    # for cancelling the agreement
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="target"
    ) + retrieve_transfer_agreement_bases(transfer_agreement=agreement, kind="source")
    authorize(permission="transfer_agreement:edit", base_ids=[b.id for b in bases])
    authorize(
        organisation_ids=[
            agreement.source_organisation_id,
            agreement.target_organisation_id,
        ]
    )
    return cancel_transfer_agreement(id=id, user_id=g.user.id)
