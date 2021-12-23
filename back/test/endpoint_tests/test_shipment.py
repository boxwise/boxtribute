from datetime import date

from boxtribute_server.enums import ShipmentState


def test_shipment_query(read_only_client, default_shipment):
    shipment_id = str(default_shipment["id"])
    query = f"""query {{
                shipment(id: {shipment_id}) {{
                    id
                    sourceBase {{
                        id
                    }}
                    targetBase {{
                        id
                    }}
                    state
                    startedBy {{
                        id
                    }}
                    startedOn
                    sentBy {{
                        id
                    }}
                    sentOn
                    completedBy {{
                        id
                    }}
                    completedOn
                    canceledBy {{
                        id
                    }}
                    canceledOn
                    transferAgreement {{
                        id
                    }}
                    details {{
                        id
                    }}
                }}
            }}"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    shipment = response.json["data"]["shipment"]

    assert shipment == {
        "id": shipment_id,
        "sourceBase": {"id": str(default_shipment["source_base"])},
        "targetBase": {"id": str(default_shipment["target_base"])},
        "state": default_shipment["state"].name,
        "startedBy": {"id": str(default_shipment["started_by"])},
        "startedOn": default_shipment["started_on"].isoformat() + "+00:00",
        "sentBy": None,
        "sentOn": None,
        "completedBy": None,
        "completedOn": None,
        "canceledBy": None,
        "canceledOn": None,
        "transferAgreement": {"id": str(default_shipment["transfer_agreement"])},
        "details": [],
    }


def test_shipments_query(read_only_client, default_shipment):
    query = "query { shipments { id } }"
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    shipments = response.json["data"]["shipments"]
    assert shipments == [{"id": str(default_shipment["id"])}]


def test_shipment_mutations(client, default_bases, default_transfer_agreement):
    source_base_id = default_bases[2]["id"]
    target_base_id = default_bases[3]["id"]
    agreement_id = default_transfer_agreement["id"]
    creation_input = f"""sourceBaseId: {source_base_id},
                         targetBaseId: {target_base_id},
                         transferAgreementId: {agreement_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id
                    sourceBase {{
                        id
                    }}
                    targetBase {{
                        id
                    }}
                    state
                    startedBy {{
                        id
                    }}
                    startedOn
                    sentBy {{
                        id
                    }}
                    sentOn
                    completedBy {{
                        id
                    }}
                    completedOn
                    canceledBy {{
                        id
                    }}
                    canceledOn
                    transferAgreement {{
                        id
                    }}
                    details {{
                        id
                    }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["createShipment"]
    shipment.pop("id")

    assert shipment.pop("startedOn").startswith(date.today().isoformat())
    assert shipment == {
        "sourceBase": {"id": str(source_base_id)},
        "targetBase": {"id": str(target_base_id)},
        "state": ShipmentState.Preparing.name,
        "startedBy": {"id": "8"},
        "sentBy": None,
        "sentOn": None,
        "completedBy": None,
        "completedOn": None,
        "canceledBy": None,
        "canceledOn": None,
        "transferAgreement": {"id": str(agreement_id)},
        "details": [],
    }


def test_shipment_mutations_create_with_non_accepted_agreement(
    read_only_client, expired_transfer_agreement
):
    agreement_id = expired_transfer_agreement["id"]
    creation_input = f"""sourceBaseId: 4,
                         targetBaseId: 5,
                         transferAgreementId: {agreement_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id }} }}"""
    data = {"query": mutation}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"


def test_shipment_mutations_create_with_invalid_base(
    read_only_client, default_bases, default_transfer_agreement
):
    source_base_id = default_bases[2]["id"]
    target_base_id = default_bases[4]["id"]  # not part of agreement
    agreement_id = default_transfer_agreement["id"]
    creation_input = f"""sourceBaseId: {source_base_id},
                         targetBaseId: {target_base_id},
                         transferAgreementId: {agreement_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id }} }}"""
    data = {"query": mutation}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
