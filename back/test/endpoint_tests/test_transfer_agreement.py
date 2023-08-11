from datetime import date

import pytest
from auth import mock_user_for_request
from boxtribute_server.enums import TransferAgreementState, TransferAgreementType
from utils import (
    assert_bad_user_input,
    assert_forbidden_request,
    assert_successful_request,
)


def test_transfer_agreement_query(
    read_only_client, default_transfer_agreement, default_shipment, sent_shipment
):
    # Test case 2.1.3
    agreement_id = str(default_transfer_agreement["id"])
    query = f"""query {{
                transferAgreement(id: {agreement_id}) {{
                    id
                    sourceOrganisation {{ id }}
                    targetOrganisation {{ id }}
                    state
                    type
                    requestedBy {{ id }}
                    requestedOn
                    acceptedBy {{ id }}
                    acceptedOn
                    terminatedBy {{ id }}
                    terminatedOn
                    validFrom
                    validUntil
                    comment
                    sourceBases {{ id }}
                    targetBases {{ id }}
                    shipments {{ id }}
                }}
            }}"""
    agreement = assert_successful_request(read_only_client, query)
    assert agreement == {
        "id": agreement_id,
        "sourceOrganisation": {
            "id": str(default_transfer_agreement["source_organisation"])
        },
        "targetOrganisation": {
            "id": str(default_transfer_agreement["target_organisation"])
        },
        "state": default_transfer_agreement["state"].name,
        "type": default_transfer_agreement["type"].name,
        "requestedBy": {"id": str(default_transfer_agreement["requested_by"])},
        "requestedOn": default_transfer_agreement["requested_on"].isoformat()
        + "+00:00",
        "acceptedBy": None,
        "acceptedOn": None,
        "terminatedBy": None,
        "terminatedOn": None,
        "comment": default_transfer_agreement["comment"],
        "validFrom": default_transfer_agreement["valid_from"].isoformat() + "+00:00",
        "validUntil": None,
        "sourceBases": [{"id": "1"}, {"id": "2"}],
        "targetBases": [{"id": "3"}],
        "shipments": [{"id": str(s["id"])} for s in [default_shipment, sent_shipment]],
    }


def state_names(value):
    if isinstance(value, str):
        if value == "":
            return "all"
        return value[10:-2]


@pytest.mark.parametrize(
    "filter_input,transfer_agreement_ids",
    (
        ["", ["1", "2", "3", "4"]],
        ["(states: [UnderReview])", ["3"]],
        ["(states: [Accepted])", ["1", "4"]],
        ["(states: [Rejected])", []],
        ["(states: [Expired])", ["2"]],
        ["(states: [Rejected, Canceled, Expired])", ["2"]],
    ),
    ids=state_names,
)
def test_transfer_agreements_query(
    read_only_client, filter_input, transfer_agreement_ids
):
    # Test cases 2.1.1, 2.1.2
    query = f"""query {{ transferAgreements{filter_input} {{ id }} }}"""
    agreements = assert_successful_request(read_only_client, query)
    assert agreements == [{"id": i} for i in transfer_agreement_ids]


def test_transfer_agreement_mutations(
    client,
    default_organisation,
    another_organisation,
    mocker,
):
    def _create_mutation(creation_input):
        return f"""mutation {{ createTransferAgreement(
                    creationInput: {{ {creation_input} }}
                    ) {{
                        id
                        sourceOrganisation {{ id }}
                        targetOrganisation {{ id }}
                        state
                        type
                        requestedBy {{ id }}
                        validFrom
                        validUntil
                        comment
                        sourceBases {{ id }}
                        targetBases {{ id }}
                        shipments {{ id }}
                    }}
                }}"""

    # Leave all optional fields empty in input
    # Test case 2.2.1
    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        initiatingOrganisationBaseIds: [1]
        type: {TransferAgreementType.Bidirectional.name}"""
    agreement = assert_successful_request(client, _create_mutation(creation_input))
    first_agreement_id = agreement.pop("id")
    assert agreement.pop("validFrom").startswith(date.today().isoformat())
    assert agreement == {
        "sourceOrganisation": {"id": str(default_organisation["id"])},
        "targetOrganisation": {"id": str(another_organisation["id"])},
        "state": TransferAgreementState.UnderReview.name,
        "type": TransferAgreementType.Bidirectional.name,
        "requestedBy": {"id": "8"},
        "validUntil": None,
        "comment": None,
        "sourceBases": [{"id": "1"}],
        "targetBases": [{"id": "3"}, {"id": "4"}],
        "shipments": [],
    }

    # Provide all available fields in input
    # Test case 2.2.2
    valid_from = "2021-12-15"
    valid_until = "2022-06-30"
    comment = "this is a comment"
    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        type: {TransferAgreementType.SendingTo.name},
        validFrom: "{valid_from}",
        validUntil: "{valid_until}",
        comment: "{comment}",
        timezone: "Europe/London",
        initiatingOrganisationBaseIds: [1],
        partnerOrganisationBaseIds: [3, 4]"""
    agreement = assert_successful_request(client, _create_mutation(creation_input))
    second_agreement_id = agreement.pop("id")
    assert agreement.pop("validFrom").startswith(valid_from)
    assert agreement.pop("validUntil").startswith(valid_until)
    assert agreement == {
        "sourceOrganisation": {"id": str(default_organisation["id"])},
        "targetOrganisation": {"id": str(another_organisation["id"])},
        "state": TransferAgreementState.UnderReview.name,
        "type": TransferAgreementType.SendingTo.name,
        "requestedBy": {"id": "8"},
        "comment": comment,
        "sourceBases": [{"id": "1"}],
        "targetBases": [{"id": "3"}, {"id": "4"}],
        "shipments": [],
    }

    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        initiatingOrganisationBaseIds: [1]
        type: {TransferAgreementType.ReceivingFrom.name}"""
    agreement = assert_successful_request(client, _create_mutation(creation_input))
    third_agreement_id = agreement.pop("id")
    assert agreement.pop("validFrom").startswith(date.today().isoformat())
    assert agreement == {
        "sourceOrganisation": {"id": str(another_organisation["id"])},
        "targetOrganisation": {"id": str(default_organisation["id"])},
        "state": TransferAgreementState.UnderReview.name,
        "type": TransferAgreementType.ReceivingFrom.name,
        "requestedBy": {"id": "8"},
        "validUntil": None,
        "comment": None,
        "sourceBases": [{"id": "3"}, {"id": "4"}],
        "targetBases": [{"id": "1"}],
        "shipments": [],
    }

    # Test case 2.2.22
    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        initiatingOrganisationBaseIds: [1]
        partnerOrganisationBaseIds: [3]
        type: {TransferAgreementType.Bidirectional.name}"""
    assert_bad_user_input(client, _create_mutation(creation_input))

    valid_until = "2022-06-25"
    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        initiatingOrganisationBaseIds: [1]
        partnerOrganisationBaseIds: [3]
        type: {TransferAgreementType.Bidirectional.name}
        validUntil: "{valid_until}" """
    assert_bad_user_input(client, _create_mutation(creation_input))

    mock_user_for_request(mocker, base_ids=[2], organisation_id=1, user_id=3)
    valid_from = "2021-12-20"
    valid_until = "2022-06-20"
    creation_input = f"""partnerOrganisationId: {another_organisation['id']},
        initiatingOrganisationId: {default_organisation['id']}
        initiatingOrganisationBaseIds: [2]
        partnerOrganisationBaseIds: [4]
        type: {TransferAgreementType.Bidirectional.name}
        validFrom: "{valid_from}"
        validUntil: "{valid_until}" """
    assert_bad_user_input(client, _create_mutation(creation_input))

    mock_user_for_request(mocker, base_ids=[3, 4], organisation_id=2, user_id=2)
    # Test case 2.2.3
    mutation = f"""mutation {{ acceptTransferAgreement(id: {first_agreement_id}) {{
                    state
                    acceptedBy {{ id }}
                    acceptedOn
                }}
            }}"""
    agreement = assert_successful_request(client, mutation)
    assert agreement.pop("acceptedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Accepted.name,
        "acceptedBy": {"id": "2"},
    }

    mutation = f"""mutation {{ acceptTransferAgreement(id: {third_agreement_id}) {{
                    state
                    acceptedBy {{ id }}
                    acceptedOn
                }}
            }}"""
    agreement = assert_successful_request(client, mutation)
    assert agreement.pop("acceptedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Accepted.name,
        "acceptedBy": {"id": "2"},
    }

    # Test case 2.2.7
    mutation = f"""mutation {{ cancelTransferAgreement(id: {first_agreement_id}) {{
                    state
                    terminatedBy {{ id }}
                    terminatedOn
                }}
            }}"""
    agreement = assert_successful_request(client, mutation)
    assert agreement.pop("terminatedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Canceled.name,
        "terminatedBy": {"id": "2"},
    }

    # Test case 2.2.5
    mutation = f"""mutation {{ rejectTransferAgreement(id: {second_agreement_id}) {{
                    state
                    terminatedBy {{ id }}
                    terminatedOn
                }}
            }}"""
    agreement = assert_successful_request(client, mutation)
    assert agreement.pop("terminatedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Rejected.name,
        "terminatedBy": {"id": "2"},
    }


@pytest.mark.parametrize("action", ["accept", "reject", "cancel"])
def test_transfer_agreement_mutations_invalid_state(
    read_only_client, mocker, expired_transfer_agreement, action
):
    # The client has to be permitted to perform the action in general
    mock_user_for_request(
        mocker,
        organisation_id=expired_transfer_agreement["target_organisation"],
        user_id=2,
        base_ids=[3],
    )
    # Test cases 2.2.11, 2.2.12, 2.2.13
    agreement_id = expired_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("action", ["accept", "reject"])
def test_transfer_agreement_mutations_as_member_of_source_org(
    read_only_client, reviewed_transfer_agreement, action
):
    # Test cases 2.2.9a, 2.2.10a
    agreement_id = reviewed_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


@pytest.mark.parametrize("action", ["accept", "reject"])
def test_transfer_agreement_mutations_as_member_of_receiving_org(
    read_only_client, receiving_transfer_agreement, action
):
    # Test cases 2.2.9b, 2.2.10b
    agreement_id = receiving_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_transfer_agreement_mutations_cancel_as_member_of_neither_org(
    read_only_client, mocker, default_transfer_agreement
):
    mock_user_for_request(mocker, organisation_id=1, user_id=2, base_ids=[2])
    # Test case 2.2.20
    agreement_id = default_transfer_agreement["id"]
    mutation = f"mutation {{ cancelTransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_transfer_agreement_mutations_identical_source_org_for_creation(
    read_only_client,
):
    # Test case 2.2.14
    mutation = """mutation { createTransferAgreement( creationInput: {
                    initiatingOrganisationId: 1
                    partnerOrganisationId: 1,
                    initiatingOrganisationBaseIds: [1]
                    type: SendingTo
                } ) { id } }"""
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("base_ids", [[3, 4], [1, 2]])
def test_transfer_agreement_mutations_create_invalid_source_base(
    read_only_client, mocker, base_ids
):
    mock_user_for_request(mocker, base_ids=[1, 3])
    # Test cases 2.2.18, 2.2.19
    mutation = f"""mutation {{ createTransferAgreement( creationInput: {{
                    initiatingOrganisationId: 1
                    partnerOrganisationId: 2,
                    initiatingOrganisationBaseIds: [{base_ids[0]}]
                    partnerOrganisationBaseIds: [{base_ids[1]}]
                    type: Bidirectional
                }} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)


def test_transfer_agreement_mutations_create_non_existent_target_org(read_only_client):
    # Test case 2.2.15
    creation_input = "initiatingOrganisationId: 1, partnerOrganisationId: 0"
    mutation = f"""mutation {{ createTransferAgreement( creationInput: {{
                    {creation_input},
                    initiatingOrganisationBaseIds: [1]
                    type: Bidirectional
                }} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("valid_until", ["2022-01-31"])
def test_transfer_agreement_mutations_invalid_dates(read_only_client, valid_until):
    # Test case 2.2.21
    mutation = f"""mutation {{ createTransferAgreement( creationInput: {{
                    initiatingOrganisationId: 1
                    partnerOrganisationId: 2,
                    initiatingOrganisationBaseIds: [1]
                    validFrom: "2022-02-01",
                    validUntil: "{valid_until}",
                    type: Bidirectional
                }} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)
