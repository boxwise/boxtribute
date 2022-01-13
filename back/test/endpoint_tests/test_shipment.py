from datetime import date

import pytest
from auth import create_jwt_payload
from boxtribute_server.enums import BoxState, ShipmentState
from utils import assert_bad_user_input


def test_shipment_query(read_only_client, default_shipment, prepared_shipment_detail):
    # Test case 3.1.2
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
    # Test case 3.1.1
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
    # Test case 3.2.1
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

    # Test case 3.2.20
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

    # Test case 3.2.26
    box_label_identifier = default_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
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
    # Same for lost_box (box state different from InStock) and default_box (already
    # added to shipment, hence box state MarkedForShipment different from InStock)
    # Test cases 3.2.27, 3.2.28
    for box in [another_box, lost_box, default_box]:
        box_label_identifier = box["label_identifier"]
        update_input = f"""{{ id: {shipment_id},
                    preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
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

    # Test case 3.2.30
    boxes = [default_box, another_marked_for_shipment_box]
    box_label_identifiers = ",".join(f'"{b["label_identifier"]}"' for b in boxes)
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
    # Test cases 3.2.31, 3.2.32
    boxes = [lost_box, marked_for_shipment_box]
    for box in boxes:
        box_label_identifier = box["label_identifier"]
        update_input = f"""{{ id: {shipment_id},
                    removedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
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

    # Test case 3.2.11
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


def test_shipment_mutations_cancel(
    client, default_shipment, another_marked_for_shipment_box
):
    # Test case 3.2.7
    shipment_id = str(default_shipment["id"])
    mutation = f"""mutation {{ cancelShipment(id: {shipment_id}) {{
                    id
                    state
                    canceledBy {{ id }}
                    canceledOn
                    details {{ id }}
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
        "details": [],
    }

    identifier = another_marked_for_shipment_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{identifier}") {{ state }} }}"""
    data = {"query": query}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["box"] == {"state": BoxState.InStock.name}


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

    # Test case 3.2.34a
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
    # Test case 3.2.39
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
    # Test case 3.2.38
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

    # Test case 3.2.40, 3.2.34b
    box_label_identifier = marked_for_shipment_box["label_identifier"]
    data = {
        "query": f"""mutation {{ updateShipment( updateInput: {{
                id: {shipment_id},
                lostBoxLabelIdentifiers: ["{box_label_identifier}"]
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
    client, *, source_base, target_base, agreement
):
    creation_input = f"""sourceBaseId: {source_base["id"]},
                         targetBaseId: {target_base["id"]},
                         transferAgreementId: {agreement["id"]}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id }} }}"""
    assert_bad_user_input(client, mutation)


def assert_bad_user_input_when_updating_shipment(
    client,
    *,
    shipment,
    target_base=None,
    lost_boxes=None,
    received_details=None,
    target_location=None,
    target_product=None,
):
    update_input = f"id: {shipment['id']}"
    if target_base is not None:
        update_input += f", targetBaseId: {target_base['id']}"
    if lost_boxes is not None:
        identifiers = ",".join(f'"{b["label_identifier"]}"' for b in lost_boxes)
        update_input += f", lostBoxLabelIdentifiers: [{identifiers}]"
    if received_details is not None:
        inputs = ", ".join(
            f"""{{ id: {detail["id"]},
                targetLocationId: {target_location["id"]},
                targetProductId: {target_product["id"]} }}"""
            for detail in received_details
        )
        update_input += f", receivedShipmentDetailUpdateInputs: [{inputs}]"
    mutation = f"""mutation {{ updateShipment(updateInput: {{ {update_input} }} ) {{
                    id }} }}"""
    assert_bad_user_input(client, mutation)


def test_shipment_mutations_create_with_non_accepted_agreement(
    read_only_client, default_bases, expired_transfer_agreement
):
    # Test case 3.2.2
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        # base IDs don't matter because validation for agreement state comes first
        source_base=default_bases[1],
        target_base=default_bases[3],
        agreement=expired_transfer_agreement,
    )


def test_shipment_mutations_create_with_invalid_base(
    read_only_client, default_bases, default_transfer_agreement
):
    # Test case 3.2.3
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        source_base=default_bases[2],
        target_base=default_bases[4],  # not part of agreement
        agreement=default_transfer_agreement,
    )


def test_shipment_mutations_create_as_target_org_member_in_unidirectional_agreement(
    read_only_client, default_bases, unidirectional_transfer_agreement
):
    # Test case 3.2.4
    # The default user (see auth_service fixture) is member of organisation 1 which is
    # the target organisation in the unidirectional_transfer_agreement fixture
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        source_base=default_bases[3],
        target_base=default_bases[2],
        agreement=unidirectional_transfer_agreement,
    )


def test_shipment_mutations_send_as_member_of_non_creating_org(
    read_only_client, another_shipment
):
    # Test case 3.2.14
    mutation = f"mutation {{ sendShipment(id: {another_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("act", ["cancel", "send"])
def test_shipment_mutations_in_non_preparing_state(
    read_only_client, canceled_shipment, act
):
    # Test cases 3.2.9, 3.2.13
    mutation = f"mutation {{ {act}Shipment(id: {canceled_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


def test_shipment_mutations_update_with_invalid_target_base(
    read_only_client, default_bases, default_shipment
):
    # Test case 3.2.24
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        target_base=default_bases[4],  # not part of agreement
        shipment=default_shipment,
    )


def test_shipment_mutations_update_in_non_preparing_state(
    read_only_client, canceled_shipment, default_bases
):
    # Test case 3.2.23
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=canceled_shipment,
        target_base=default_bases[2],
    )


def test_shipment_mutations_update_as_member_of_non_creating_org(
    read_only_client, another_shipment, default_bases
):
    # Test case 3.2.25
    # The default user (see auth_service fixture) is member of organisation 1 but
    # organisation 2 is the one that created another_shipment
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=another_shipment,
        target_base=default_bases[2],
    )


def test_shipment_mutations_update_checked_in_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    default_shipment_detail,
    another_location,
    another_product,
):
    # Test case 3.2.35
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=sent_shipment,
        received_details=[default_shipment_detail],
        target_location=another_location,
        target_product=another_product,
    )


def test_shipment_mutations_update_mark_lost_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    marked_for_shipment_box,
):
    # Test case 3.2.41
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=sent_shipment,
        lost_boxes=[marked_for_shipment_box],
    )


def test_shipment_mutations_update_checked_in_boxes_when_shipment_in_non_sent_state(
    read_only_client,
    mocker,
    default_shipment,
    prepared_shipment_detail,
    another_location,
    another_product,
):
    # Test case 3.2.36
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=default_shipment,
        received_details=[prepared_shipment_detail],
        target_location=another_location,
        target_product=another_product,
    )
