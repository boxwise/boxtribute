from ariadne import QueryType

from ...authz import agreement_organisation_filter_condition, authorize
from ...models.definitions.transfer_agreement import TransferAgreement
from .crud import retrieve_transfer_agreement_bases

query = QueryType()


@query.field("transferAgreement")
def resolve_transfer_agreement(*_, id):
    agreement = TransferAgreement.get_by_id(id)
    bases = retrieve_transfer_agreement_bases(
        transfer_agreement=agreement, kind="source"
    ) + retrieve_transfer_agreement_bases(transfer_agreement=agreement, kind="target")
    authorize(permission="transfer_agreement:read", base_ids=[b.id for b in bases])
    return agreement


@query.field("transferAgreements")
def resolve_transfer_agreements(*_, states=None):
    # No state filter by default
    state_filter = TransferAgreement.state << states if states else True
    return TransferAgreement.select().where(
        agreement_organisation_filter_condition() & (state_filter)
    )
