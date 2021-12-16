import pytest
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
        "state": TransferAgreementState(default_transfer_agreement["state"]).name,
        "type": TransferAgreementType(default_transfer_agreement["type"]).name,
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
        ["", ["1", "2"]],
        ["(states: [UnderReview])", []],
        ["(states: [Accepted])", ["1"]],
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
