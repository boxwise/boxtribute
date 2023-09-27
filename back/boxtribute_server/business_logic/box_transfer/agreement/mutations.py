from ariadne import MutationType
from flask import g

from ....authz import authorize
from ....enums import TransferAgreementType
from ....exceptions import Forbidden
from ....models.definitions.transfer_agreement import TransferAgreement
from .crud import (
    accept_transfer_agreement,
    cancel_transfer_agreement,
    create_transfer_agreement,
    reject_transfer_agreement,
    retrieve_transfer_agreement_bases,
)

mutation = MutationType()


@mutation.field("createTransferAgreement")
def resolve_create_transfer_agreement(*_, creation_input):
    # Enforce that user is authzed for ALL specified bases (using authorize() with the
    # base_ids argument succeeds if user authzed for at least one base already)
    for base_id in creation_input["initiating_organisation_base_ids"]:
        authorize(permission="transfer_agreement:create", base_id=base_id)
    return create_transfer_agreement(**creation_input, user=g.user)


@mutation.field("acceptTransferAgreement")
def resolve_accept_transfer_agreement(*_, id):
    # For SendingTo/Bidirectional agreements, the user must be member of all target
    # bases to be authorized for accepting the agreement. For ReceivingFrom they must be
    # member of all source bases
    agreement = TransferAgreement.get_by_id(id)
    kind = (
        "source" if agreement.type == TransferAgreementType.ReceivingFrom else "target"
    )
    for base in retrieve_transfer_agreement_bases(agreement=agreement, kind=kind):
        authorize(permission="transfer_agreement:edit", base_id=base.id)
    return accept_transfer_agreement(id=id, user=g.user)


@mutation.field("rejectTransferAgreement")
def resolve_reject_transfer_agreement(*_, id):
    # For SendingTo/Bidirectional agreements, the user must be member of at least one of
    # the target bases to be authorized for rejecting the agreement. For ReceivingFrom
    # they must be member of at least one of the source bases
    agreement = TransferAgreement.get_by_id(id)
    kind = (
        "source" if agreement.type == TransferAgreementType.ReceivingFrom else "target"
    )
    for base in retrieve_transfer_agreement_bases(agreement=agreement, kind=kind):
        authorize(permission="transfer_agreement:edit", base_id=base.id)
    return reject_transfer_agreement(id=id, user=g.user)


@mutation.field("cancelTransferAgreement")
def resolve_cancel_transfer_agreement(*_, id):
    # User must be member of either all source or all target bases to be authorized
    # for cancelling the agreement
    agreement = TransferAgreement.get_by_id(id)
    source_bases = retrieve_transfer_agreement_bases(agreement=agreement, kind="source")
    try:
        for base in source_bases:
            authorize(permission="transfer_agreement:edit", base_id=base.id)
    except Forbidden:
        target_bases = retrieve_transfer_agreement_bases(
            agreement=agreement, kind="target"
        )
        for base in target_bases:
            authorize(permission="transfer_agreement:edit", base_id=base.id)

    return cancel_transfer_agreement(id=id, user_id=g.user.id)
