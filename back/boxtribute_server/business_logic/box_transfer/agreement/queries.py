from ariadne import QueryType

from ....authz import authorize, authorized_bases_filter
from ....models.definitions.transfer_agreement import TransferAgreement
from ....models.definitions.transfer_agreement_detail import TransferAgreementDetail
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
    return (
        TransferAgreement.select()
        .join(TransferAgreementDetail)
        .where(
            state_filter,
            # Filter for all agreements with have source/target bases that the user is
            # authorized for
            authorized_bases_filter(
                TransferAgreementDetail, base_fk_field_name="source_base"
            )
            | authorized_bases_filter(
                TransferAgreementDetail, base_fk_field_name="target_base"
            ),
        )
        .distinct()
    )
