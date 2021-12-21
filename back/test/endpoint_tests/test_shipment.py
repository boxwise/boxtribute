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
