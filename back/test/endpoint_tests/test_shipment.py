from datetime import date

import pytest
from boxtribute_server.enums import BoxState, ShipmentState
from utils import assert_bad_user_input


def test_shipment_query(read_only_client, default_shipment, prepared_shipment_detail):
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
        "details": [{"id": str(prepared_shipment_detail["id"])}],
    }


def test_shipments_query(
    read_only_client,
    default_shipment,
    canceled_shipment,
    another_shipment,
    sent_shipment,
):
    query = "query { shipments { id } }"
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    shipments = response.json["data"]["shipments"]
    assert shipments == [
        {"id": str(s["id"])}
        for s in [default_shipment, canceled_shipment, another_shipment, sent_shipment]
    ]


def test_shipment_mutations(
    client,
    default_bases,
    default_transfer_agreement,
    default_shipment,
    default_box,
    another_box,
    box_without_qr_code,
    lost_box,
    prepared_shipment_detail,
):
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
    shipment_id = str(shipment.pop("id"))

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

    mutation = f"""mutation {{ cancelShipment(id: {shipment_id}) {{
                    id
                    state
                    canceledBy {{
                        id
                    }}
                    canceledOn
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["cancelShipment"]

    assert shipment.pop("canceledOn").startswith(date.today().isoformat())
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Canceled.name,
        "canceledBy": {"id": "8"},
    }

    shipment_id = str(default_shipment["id"])
    update_input = f"""{{ id: {shipment_id},
                targetBaseId: {target_base_id} }}"""
    mutation = f"""mutation {{ updateShipment(updateInput: {update_input}) {{
                    id
                    state
                    targetBase {{
                        id
                    }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Preparing.name,
        "targetBase": {"id": str(target_base_id)},
    }

    box_label_identifier = default_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: [{box_label_identifier}] }}"""
    mutation = f"""mutation {{ updateShipment(updateInput: {update_input}) {{
                    id
                    state
                    details {{
                        id
                        shipment {{
                            id
                        }}
                        box {{
                            id
                            state
                        }}
                        sourceProduct {{
                            id
                        }}
                        targetProduct {{
                            id
                        }}
                        sourceLocation {{
                            id
                        }}
                        targetLocation {{
                            id
                        }}
                        createdBy {{
                            id
                        }}
                        createdOn
                        deletedBy {{
                            id
                        }}
                        deletedOn
                    }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment["details"][0].pop("createdOn").startswith(date.today().isoformat())
    assert shipment["details"][1].pop("createdOn").startswith(date.today().isoformat())
    shipment_detail_id = shipment["details"][1].pop("id")
    prepared_shipment_detail_id = str(prepared_shipment_detail["id"])
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Preparing.name,
        "details": [
            {
                "id": prepared_shipment_detail_id,
                "shipment": {"id": shipment_id},
                "box": {
                    "id": str(box_without_qr_code["id"]),
                    "state": BoxState.MarkedForShipment.name,
                },
                "sourceProduct": {"id": str(box_without_qr_code["product"])},
                "targetProduct": None,
                "sourceLocation": {"id": str(box_without_qr_code["location"])},
                "targetLocation": None,
                "createdBy": {"id": "1"},
                "deletedBy": None,
                "deletedOn": None,
            },
            {
                "shipment": {"id": shipment_id},
                "box": {
                    "id": str(default_box["id"]),
                    "state": BoxState.MarkedForShipment.name,
                },
                "sourceProduct": {"id": str(default_box["product"])},
                "targetProduct": None,
                "sourceLocation": {"id": str(default_box["location"])},
                "targetLocation": None,
                "createdBy": {"id": "8"},
                "deletedBy": None,
                "deletedOn": None,
            },
        ],
    }

    # Verify that another_box is not added to shipment (not located in source base).
    # Same for lost_box (box state different from InStock)
    for box in [another_box, lost_box]:
        box_label_identifier = box["label_identifier"]
        update_input = f"""{{ id: {shipment_id},
                    preparedBoxLabelIdentifiers: [{box_label_identifier}] }}"""
        mutation = f"""mutation {{ updateShipment(updateInput: {update_input}) {{
                        details {{ id }}
                    }} }}"""
        data = {"query": mutation}
        response = client.post("/graphql", json=data)
        assert response.status_code == 200
        shipment = response.json["data"]["updateShipment"]
        assert shipment == {
            "details": [
                {"id": i} for i in [prepared_shipment_detail_id, shipment_detail_id]
            ]
        }

    boxes = [default_box, box_without_qr_code]
    box_label_identifiers = ",".join(b["label_identifier"] for b in boxes)
    update_input = f"""{{ id: {shipment_id},
                removedBoxLabelIdentifiers: [{box_label_identifiers}] }}"""
    mutation = f"""mutation {{ updateShipment(updateInput: {update_input}) {{
                    id
                    state
                    details {{
                        id
                    }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Preparing.name,
        "details": [],
    }
    for box in boxes:
        box_label_identifier = box["label_identifier"]
        query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                        state }} }}"""
        data = {"query": query}
        response = client.post("/graphql", json=data)
        assert response.json["data"]["box"] == {"state": BoxState.InStock.name}

    # Verify that lost_box is not removed from shipment (box state different from
    # MarkedForShipment)
    box_label_identifier = lost_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                removedBoxLabelIdentifiers: [{box_label_identifier}] }}"""
    mutation = f"""mutation {{ updateShipment(updateInput: {update_input}) {{
                    details {{ id }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment == {"details": []}

    mutation = f"""mutation {{ sendShipment(id: {shipment_id}) {{
                    id
                    state
                    sentBy {{
                        id
                    }}
                    sentOn
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["sendShipment"]

    assert shipment.pop("sentOn").startswith(date.today().isoformat())
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Sent.name,
        "sentBy": {"id": "8"},
    }


def assert_bad_user_input_when_creating_shipment(
    client, *, source_base_id, target_base_id, agreement_id
):
    creation_input = f"""sourceBaseId: {source_base_id},
                         targetBaseId: {target_base_id},
                         transferAgreementId: {agreement_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id }} }}"""
    assert_bad_user_input(client, mutation)


def assert_bad_user_input_when_updating_shipment(
    client, *, target_base_id=None, shipment_id
):
    update_input = f"id: {shipment_id}"
    if target_base_id is not None:
        update_input += f", targetBaseId: {target_base_id}"
    mutation = f"""mutation {{ updateShipment(updateInput: {{ {update_input} }} ) {{
                    id }} }}"""
    assert_bad_user_input(client, mutation)


def test_shipment_mutations_create_with_non_accepted_agreement(
    read_only_client, default_bases, expired_transfer_agreement
):
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        # base IDs don't matter because validation for agreement state comes first
        source_base_id=default_bases[1]["id"],
        target_base_id=default_bases[3]["id"],
        agreement_id=expired_transfer_agreement["id"],
    )


def test_shipment_mutations_create_with_invalid_base(
    read_only_client, default_bases, default_transfer_agreement
):
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        source_base_id=default_bases[2]["id"],
        target_base_id=default_bases[4]["id"],  # not part of agreement
        agreement_id=default_transfer_agreement["id"],
    )


def test_shipment_mutations_create_as_target_org_member_in_unidirectional_agreement(
    read_only_client, default_bases, unidirectional_transfer_agreement
):
    # The default user (see auth_service fixture) is member of organisation 1 which is
    # the target organisation in the unidirectional_transfer_agreement fixture
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        source_base_id=default_bases[3]["id"],
        target_base_id=default_bases[2]["id"],
        agreement_id=unidirectional_transfer_agreement["id"],
    )


def test_shipment_mutations_send_as_member_of_non_creating_org(
    read_only_client, another_shipment
):
    mutation = f"mutation {{ sendShipment(id: {another_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("act", ["cancel", "send"])
def test_shipment_mutations_in_non_preparing_state(
    read_only_client, canceled_shipment, act
):
    mutation = f"mutation {{ {act}Shipment(id: {canceled_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


def test_shipment_mutations_update_with_invalid_base(
    read_only_client, default_bases, default_shipment
):
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        target_base_id=default_bases[4]["id"],  # not part of agreement
        shipment_id=default_shipment["id"],
    )


def test_shipment_mutations_update_in_non_preparing_state(
    read_only_client, canceled_shipment
):
    assert_bad_user_input_when_updating_shipment(
        read_only_client, shipment_id=canceled_shipment["id"]
    )


def test_shipment_mutations_update_as_member_of_non_creating_org(
    read_only_client, another_shipment, default_bases
):
    # The default user (see auth_service fixture) is member of organisation 1 but
    # organisation 2 is the one that created another_shipment
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment_id=another_shipment["id"],
        target_base_id=default_bases[2]["id"],
    )
