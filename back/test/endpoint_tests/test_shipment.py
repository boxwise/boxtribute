from datetime import date

import pytest
from auth import create_jwt_payload
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


def test_shipment_mutations_on_source_side(
    client,
    default_bases,
    default_transfer_agreement,
    default_shipment,
    default_box,
    another_box,
    another_marked_for_shipment_box,
    lost_box,
    marked_for_shipment_box,
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
                    "id": str(another_marked_for_shipment_box["id"]),
                    "state": BoxState.MarkedForShipment.name,
                },
                "sourceProduct": {
                    "id": str(another_marked_for_shipment_box["product"])
                },
                "targetProduct": None,
                "sourceLocation": {
                    "id": str(another_marked_for_shipment_box["location"])
                },
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

    boxes = [default_box, another_marked_for_shipment_box]
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
    # MarkedForShipment).
    # Same for marked_for_shipment_box (not part of shipment)
    boxes = [lost_box, marked_for_shipment_box]
    for box in boxes:
        box_label_identifier = box["label_identifier"]
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
    for box in boxes:
        box_label_identifier = box["label_identifier"]
        query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                        state }} }}"""
        data = {"query": query}
        response = client.post("/graphql", json=data)
        assert response.json["data"]["box"] == {"state": BoxState(box["state"]).name}

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


def test_shipment_mutations_on_target_side(
    client,
    mocker,
    sent_shipment,
    default_shipment_detail,
    another_shipment_detail,
    another_location,
    another_product,
    default_product,
    default_location,
    box_without_qr_code,
    marked_for_shipment_box,
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )

    target_product_id = str(another_product["id"])
    target_location_id = str(another_location["id"])
    shipment_id = str(sent_shipment["id"])
    detail_id = str(default_shipment_detail["id"])
    another_detail_id = str(another_shipment_detail["id"])

    def _create_mutation(*, detail_id, target_product_id, target_location_id):
        update_input = f"""id: {shipment_id},
                receivedShipmentDetailUpdateInputs: {{
                        id: {detail_id},
                        targetProductId: {target_product_id},
                        targetLocationId: {target_location_id}
                    }}"""
        return f"""mutation {{ updateShipment(updateInput: {{ {update_input} }}) {{
                        id
                        state
                        completedBy {{
                            id
                        }}
                        completedOn
                        details {{
                            id
                            targetProduct {{
                                id
                            }}
                            targetLocation {{
                                id
                            }}
                            box {{
                                state
                            }}
                        }}
                    }} }}"""

    data = {
        "query": _create_mutation(
            detail_id=detail_id,
            target_product_id=target_product_id,
            target_location_id=target_location_id,
        )
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]

    expected_shipment = {
        "id": shipment_id,
        "state": ShipmentState.Sent.name,
        "completedBy": None,
        "completedOn": None,
        "details": [
            {
                "id": detail_id,
                "box": {"state": BoxState.Received.name},
                "targetProduct": {"id": target_product_id},
                "targetLocation": {"id": target_location_id},
            },
            {
                "id": another_detail_id,
                "box": {"state": BoxState.MarkedForShipment.name},
                "targetProduct": None,
                "targetLocation": None,
            },
        ],
    }
    assert shipment == expected_shipment

    # Verify that another_detail_id is not updated (invalid product)
    data = {
        "query": _create_mutation(
            detail_id=another_detail_id,
            target_product_id=default_product["id"],
            target_location_id=target_location_id,
        )
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment == expected_shipment

    # Verify that another_detail_id is not updated (invalid location)
    data = {
        "query": _create_mutation(
            detail_id=another_detail_id,
            target_product_id=target_product_id,
            target_location_id=default_location["id"],
        )
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]
    assert shipment == expected_shipment

    data = {
        "query": f"""mutation {{ updateShipment( updateInput: {{
                id: {shipment_id},
                lostBoxLabelIdentifiers: [{marked_for_shipment_box['label_identifier']}]
            }} ) {{
                id
                state
                completedBy {{ id }}
                completedOn
                details {{ id }}
            }} }}"""
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    shipment = response.json["data"]["updateShipment"]

    assert shipment.pop("completedOn").startswith(date.today().isoformat())
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Completed.name,
        "completedBy": {"id": "2"},
        "details": [],
    }
    box_label_identifier = box_without_qr_code["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                    state
                    product {{ id }}
                    location {{ id }}
    }} }}"""
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.json["data"]["box"] == {
        "state": BoxState.InStock.name,
        "product": {"id": target_product_id},
        "location": {"id": target_location_id},
    }

    # The box is still registered in the source base, hence any user from the target
    # organisation can't access it
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload()
    box_label_identifier = marked_for_shipment_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                    state }} }}"""
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.json["data"]["box"] == {"state": BoxState.Lost.name}


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
    client,
    *,
    shipment_id,
    target_base_id=None,
    lost_box_label_identifiers=None,
    received_detail_ids=None,
    target_location_id=None,
    target_product_id=None,
):
    update_input = f"id: {shipment_id}"
    if target_base_id is not None:
        update_input += f", targetBaseId: {target_base_id}"
    if lost_box_label_identifiers is not None:
        identifiers = ",".join(lost_box_label_identifiers)
        update_input += f", lostBoxLabelIdentifiers: [{identifiers}]"
    if received_detail_ids is not None:
        inputs = ", ".join(
            f"""{{ id: {i},
                targetLocationId: {target_location_id},
                targetProductId: {target_product_id} }}"""
            for i in received_detail_ids
        )
        update_input += f", receivedShipmentDetailUpdateInputs: [{inputs}]"
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
    read_only_client, canceled_shipment, default_bases
):
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment_id=canceled_shipment["id"],
        target_base_id=default_bases[2]["id"],
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


def test_shipment_mutations_update_checked_in_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    default_shipment_detail,
    another_location,
    another_product,
):
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment_id=sent_shipment["id"],
        received_detail_ids=[default_shipment_detail["id"]],
        target_location_id=another_location["id"],
        target_product_id=another_product["id"],
    )


def test_shipment_mutations_update_mark_lost_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    marked_for_shipment_box,
):
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment_id=sent_shipment["id"],
        lost_box_label_identifiers=[marked_for_shipment_box["label_identifier"]],
    )


def test_shipment_mutations_update_checked_in_boxes_when_shipment_in_non_sent_state(
    read_only_client,
    mocker,
    default_shipment,
    prepared_shipment_detail,
    another_location,
    another_product,
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment_id=default_shipment["id"],
        received_detail_ids=[prepared_shipment_detail["id"]],
        target_location_id=another_location["id"],
        target_product_id=another_product["id"],
    )
