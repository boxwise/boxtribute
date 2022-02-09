from datetime import date

import pytest
from auth import create_jwt_payload
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
                        sourceBases {{ id }}
                        targetBases {{ id }}
                        shipments {{ id }}
                    }}
                }}"""

    # Leave all optional fields empty in input
    # Test case 2.2.1
    creation_input = f"""targetOrganisationId: {another_organisation['id']},
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
        "sourceBases": [{"id": "1"}, {"id": "2"}],
        "targetBases": [{"id": "3"}, {"id": "4"}],
        "shipments": [],
    }

    # Provide all available fields in input
    # Test case 2.2.2
    valid_from = "2021-12-15"
    valid_until = "2022-06-30"
    creation_input = f"""targetOrganisationId: {another_organisation['id']},
        type: {TransferAgreementType.Bidirectional.name},
        validFrom: "{valid_from}",
        validUntil: "{valid_until}",
        timezone: "Europe/London",
        sourceBaseIds: [1],
        targetBaseIds: [3]"""
    agreement = assert_successful_request(client, _create_mutation(creation_input))
    second_agreement_id = agreement.pop("id")
    assert agreement.pop("validFrom").startswith(valid_from)
    assert agreement.pop("validUntil").startswith(valid_until)
    assert agreement == {
        "sourceOrganisation": {"id": str(default_organisation["id"])},
        "targetOrganisation": {"id": str(another_organisation["id"])},
        "state": TransferAgreementState.UnderReview.name,
        "type": TransferAgreementType.Bidirectional.name,
        "requestedBy": {"id": "8"},
        "sourceBases": [{"id": "1"}],
        "targetBases": [{"id": "3"}],
        "shipments": [],
    }

    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
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
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        organisation_id=expired_transfer_agreement["target_organisation"], user_id=2
    )
    # Test cases 2.2.11, 2.2.12, 2.2.13
    agreement_id = expired_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("action", ["accept", "reject"])
def test_transfer_agreement_mutations_as_member_of_source_org(
    read_only_client, reviewed_transfer_agreement, action
):
    # Test cases 2.2.9, 2.2.10
    agreement_id = reviewed_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_transfer_agreement_mutations_cancel_as_member_of_neither_org(
    read_only_client, mocker, default_transfer_agreement
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        organisation_id=3, user_id=2
    )
    # Test case 2.2.20
    agreement_id = default_transfer_agreement["id"]
    mutation = f"mutation {{ cancelTransferAgreement(id: {agreement_id}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_transfer_agreement_mutations_identical_source_org_for_creation(
    read_only_client,
):
    # Test case 2.2.14
    mutation = """mutation { createTransferAgreement( creationInput: {
                    targetOrganisationId: 1,
                    type: Unidirectional
                } ) { id } }"""
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("kind,base_id", [["source", 3], ["target", 1]])
def test_transfer_agreement_mutations_create_invalid_source_base(
    read_only_client, kind, base_id
):
    # Test cases 2.2.18, 2.2.19
    mutation = f"""mutation {{ createTransferAgreement( creationInput: {{
                    targetOrganisationId: 2,
                    {kind}BaseIds: [{base_id}],
                    type: Bidirectional
                }} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)


def test_transfer_agreement_mutations_create_non_existent_target_org(read_only_client):
    # Test case 2.2.15
    creation_input = "targetOrganisationId: 0"
    mutation = f"""mutation {{ createTransferAgreement( creationInput: {{
                    {creation_input},
                    type: Bidirectional
                }} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)
