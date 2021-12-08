from boxtribute_server.enums import TransferAgreementState, TransferAgreementType
from boxtribute_server.models.definitions.transfer_agreement import TransferAgreement


def test_transfer_agreement(
    default_transfer_agreement, default_organisation, another_organisation
):
    agreement = TransferAgreement.get_by_id(default_transfer_agreement["id"])

    assert agreement.source_organisation.id == default_organisation["id"]
    assert agreement.source_organisation_id == default_organisation["id"]
    assert agreement.target_organisation.id == another_organisation["id"]
    assert agreement.state == TransferAgreementState.ACCEPTED.value
    assert agreement.type == TransferAgreementType.BIDIRECTIONAL.value
