from datetime import date

import pytest
from auth import create_jwt_payload
from boxtribute_server.enums import TransferAgreementState, TransferAgreementType


def test_transfer_agreement_query(
    read_only_client, default_transfer_agreement, default_shipment
):
    agreement_id = str(default_transfer_agreement["id"])
    query = f"""query {{
                transferAgreement(id: {agreement_id}) {{
                    id
                    sourceOrganisation {{
                        id
                    }}
                    targetOrganisation {{
                        id
                    }}
                    state
                    type
                    requestedBy {{
                        id
                    }}
                    requestedOn
                    acceptedBy {{
                        id
                    }}
                    acceptedOn
                    terminatedBy {{
                        id
                    }}
                    terminatedOn
                    validFrom
                    validUntil
                    comment
                    sourceBases {{
                        id
                    }}
                    targetBases {{
                        id
                    }}
                    shipments {{
                        id
                    }}
                }}
            }}"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    agreement = response.json["data"]["transferAgreement"]

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
        "shipments": [{"id": str(default_shipment["id"])}],
    }


def state_names(value):
    if isinstance(value, str):
        if value == "":
            return "all"
        return value[10:-2]


@pytest.mark.parametrize(
    "filter_input,transfer_agreement_ids",
    (
        ["", ["1", "2", "3"]],
        ["(states: [UnderReview])", ["3"]],
        ["(states: [Accepted])", ["1"]],
        ["(states: [Rejected])", []],
        ["(states: [Expired])", ["2"]],
        ["(states: [Rejected, Canceled, Expired])", ["2"]],
    ),
    ids=state_names,
)
def test_transfer_agreements_query(
    read_only_client, filter_input, transfer_agreement_ids
):
    query = f"""query {{ transferAgreements{filter_input} {{ id }} }}"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    agreements = response.json["data"]["transferAgreements"]
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
                        sourceOrganisation {{
                            id
                        }}
                        targetOrganisation {{
                            id
                        }}
                        state
                        type
                        requestedBy {{
                            id
                        }}
                        validFrom
                        validUntil
                        sourceBases {{
                            id
                        }}
                        targetBases {{
                            id
                        }}
                        shipments {{
                            id
                        }}
                    }}
                }}"""

    # Leave all optional fields empty in input
    creation_input = f"""targetOrganisationId: {another_organisation['id']},
        type: {TransferAgreementType.Bidirectional.name}"""
    data = {"query": _create_mutation(creation_input)}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    agreement = response.json["data"]["createTransferAgreement"]
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
    valid_from = "2021-12-15"
    valid_until = "2022-06-30"
    creation_input = f"""targetOrganisationId: {another_organisation['id']},
        type: {TransferAgreementType.Bidirectional.name},
        validFrom: "{valid_from}",
        validUntil: "{valid_until}",
        timezone: "Europe/London",
        sourceBaseIds: [1],
        targetBaseIds: [3]"""
    data = {"query": _create_mutation(creation_input)}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    agreement = response.json["data"]["createTransferAgreement"]
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
    mutation = f"""mutation {{ acceptTransferAgreement(id: {first_agreement_id}) {{
                    state
                    acceptedBy {{
                        id
                    }}
                    acceptedOn
                }}
            }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    agreement = response.json["data"]["acceptTransferAgreement"]
    assert agreement.pop("acceptedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Accepted.name,
        "acceptedBy": {"id": "2"},
    }

    mutation = f"""mutation {{ cancelTransferAgreement(id: {first_agreement_id}) {{
                    state
                    terminatedBy {{
                        id
                    }}
                    terminatedOn
                }}
            }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    agreement = response.json["data"]["cancelTransferAgreement"]
    assert agreement.pop("terminatedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Canceled.name,
        "terminatedBy": {"id": "2"},
    }

    mutation = f"""mutation {{ rejectTransferAgreement(id: {second_agreement_id}) {{
                    state
                    terminatedBy {{
                        id
                    }}
                    terminatedOn
                }}
            }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    agreement = response.json["data"]["rejectTransferAgreement"]
    assert agreement.pop("terminatedOn").startswith(date.today().isoformat())
    assert agreement == {
        "state": TransferAgreementState.Rejected.name,
        "terminatedBy": {"id": "2"},
    }


@pytest.mark.parametrize("action", ["accept", "reject", "cancel"])
def test_transfer_agreement_mutations_invalid_state(
    read_only_client, expired_transfer_agreement, action
):
    agreement_id = expired_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    data = {"query": mutation}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"


@pytest.mark.parametrize("action", ["accept", "reject"])
def test_transfer_agreement_mutations_invalid_source_org(
    read_only_client, reviewed_transfer_agreement, action
):
    agreement_id = reviewed_transfer_agreement["id"]
    mutation = f"mutation {{ {action}TransferAgreement(id: {agreement_id}) {{ id }} }}"
    data = {"query": mutation}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"


def test_transfer_agreement_mutations_identical_source_org_for_creation(
    read_only_client,
):
    mutation = """mutation { createTransferAgreement( creationInput: {
                    targetOrganisationId: 1,
                    type: Unidirectional
                } ) { id } }"""
    data = {"query": mutation}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
