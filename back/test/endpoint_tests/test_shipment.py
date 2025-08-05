import time
from datetime import date, datetime

import pytest
from auth import mock_user_for_request
from boxtribute_server.enums import BoxState, ShipmentState
from utils import (
    assert_bad_user_input,
    assert_forbidden_request,
    assert_successful_request,
)

# Define common prefix for change messages for shorter line length
change_prefix = "changed box state from"
today = date.today().isoformat()
source_base_user_id = "8"
target_base_user_id = "2"


@pytest.fixture
def mock_default_target_base_user(mocker, another_base, another_organisation):
    mock_user_for_request(
        mocker,
        base_ids=[another_base["id"]],
        organisation_id=another_organisation["id"],
        user_id=target_base_user_id,
    )


def test_shipment_query(
    read_only_client, default_shipment, prepared_shipment_detail, products
):
    # Test case 3.1.2
    shipment_id = str(default_shipment["id"])
    query = f"""query {{
                shipment(id: {shipment_id}) {{
                    id
                    labelIdentifier
                    sourceBase {{ id }}
                    targetBase {{ id }}
                    state
                    startedBy {{ id }}
                    startedOn
                    sentBy {{ id }}
                    sentOn
                    receivingStartedBy {{ id }}
                    receivingStartedOn
                    completedBy {{ id }}
                    completedOn
                    canceledBy {{ id }}
                    canceledOn
                    transferAgreement {{ id }}
                    details {{ id autoMatchingTargetProduct {{ id }} }}
                }}
            }}"""
    shipment = assert_successful_request(read_only_client, query)
    start_timestamp = datetime.strftime(default_shipment["started_on"], "%y%m%d")
    assert shipment == {
        "id": shipment_id,
        "labelIdentifier": f"S001-{start_timestamp}-THxWÜ",
        "sourceBase": {"id": str(default_shipment["source_base"])},
        "targetBase": {"id": str(default_shipment["target_base"])},
        "state": default_shipment["state"].name,
        "startedBy": {"id": str(default_shipment["started_by"])},
        "startedOn": default_shipment["started_on"].isoformat() + "+00:00",
        "sentBy": None,
        "sentOn": None,
        "receivingStartedBy": None,
        "receivingStartedOn": None,
        "completedBy": None,
        "completedOn": None,
        "canceledBy": None,
        "canceledOn": None,
        "transferAgreement": {"id": str(default_shipment["transfer_agreement"])},
        "details": [
            {
                "id": str(prepared_shipment_detail["id"]),
                "autoMatchingTargetProduct": {"id": str(products[6]["id"])},
            }
        ],
    }


def test_shipments_query(
    read_only_client,
    default_shipment,
    canceled_shipment,
    another_shipment,
    sent_shipment,
    receiving_shipment,
    completed_shipment,
    intra_org_shipment,
):
    # Test case 3.1.1
    query = "query { shipments { id } }"
    shipments = assert_successful_request(read_only_client, query)
    assert shipments == [
        {"id": str(s["id"])}
        for s in [
            default_shipment,
            canceled_shipment,
            another_shipment,
            sent_shipment,
            receiving_shipment,
            completed_shipment,
            intra_org_shipment,
        ]
    ]

    query = "query { shipments(states: [Preparing]) { id } }"
    shipments = assert_successful_request(read_only_client, query)
    assert shipments == [
        {"id": str(s["id"])}
        for s in [
            default_shipment,
            another_shipment,
            intra_org_shipment,
        ]
    ]

    query = "query { shipments(states: [Canceled, Sent]) { id } }"
    shipments = assert_successful_request(read_only_client, query)
    assert shipments == [
        {"id": str(s["id"])} for s in [canceled_shipment, sent_shipment]
    ]


def test_source_base_box_product_as_null_for_target_side(
    read_only_client, another_shipment, another_box
):
    # Test case 8.1.12a, 8.1.12b
    shipment_id = str(another_shipment["id"])
    query = f"""query {{
                shipment(id: {shipment_id}) {{
                    details {{
                        box {{
                            labelIdentifier
                            product {{ id }}
                            location {{ id }}
                        }}
                        sourceProduct {{ id }}
                        sourceLocation {{ id }}
                    }} }} }}"""
    shipment = assert_successful_request(read_only_client, query)
    assert shipment == {
        "details": [
            {
                "box": {
                    "labelIdentifier": another_box["label_identifier"],
                    "product": None,
                    "location": None,
                },
                "sourceProduct": {"id": str(another_box["product"])},
                "sourceLocation": {"id": str(another_box["location"])},
            },
        ]
    }


def test_shipment_mutations_on_source_side(
    client,
    default_base,
    another_base,
    default_transfer_agreement,
    default_shipment,
    default_box,
    another_box,
    another_marked_for_shipment_box,
    lost_box,
    marked_for_shipment_box,
    measure_product_box,
    prepared_shipment_detail,
):
    # Test case 3.2.1a
    source_base_id = default_base["id"]
    target_base_id = another_base["id"]
    agreement_id = default_transfer_agreement["id"]
    creation_input = f"""sourceBaseId: {source_base_id},
                         targetBaseId: {target_base_id},
                         transferAgreementId: {agreement_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id
                    sourceBase {{ id }}
                    targetBase {{ id }}
                    state
                    startedBy {{ id }}
                    startedOn
                    sentBy {{ id }}
                    sentOn
                    receivingStartedBy {{ id }}
                    receivingStartedOn
                    completedBy {{ id }}
                    completedOn
                    canceledBy {{ id }}
                    canceledOn
                    transferAgreement {{ id }}
                    details {{ id }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    shipment_id = str(shipment.pop("id"))
    assert shipment.pop("startedOn").startswith(today)
    assert shipment == {
        "sourceBase": {"id": str(source_base_id)},
        "targetBase": {"id": str(target_base_id)},
        "state": ShipmentState.Preparing.name,
        "startedBy": {"id": source_base_user_id},
        "sentBy": None,
        "sentOn": None,
        "receivingStartedBy": None,
        "receivingStartedOn": None,
        "completedBy": None,
        "completedOn": None,
        "canceledBy": None,
        "canceledOn": None,
        "transferAgreement": {"id": str(agreement_id)},
        "details": [],
    }

    box_label_identifier = measure_product_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    details {{
                        sourceSize {{ id }}
                        box {{ id measureValue }}
                        autoMatchingTargetProduct {{ id }}
                    }} }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {
        "details": [
            {
                "sourceSize": None,
                "box": {
                    "id": str(measure_product_box["id"]),
                    "measureValue": 500.0,
                },
                "autoMatchingTargetProduct": None,
            }
        ]
    }
    # Test case 3.2.20
    shipment_id = str(default_shipment["id"])
    update_input = f"""{{ id: {shipment_id},
                targetBaseId: {target_base_id} }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    id
                    state
                    targetBase {{ id }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Preparing.name,
        "targetBase": {"id": str(target_base_id)},
    }

    # Test case 3.2.26
    box_label_identifier = default_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    id
                    state
                    details {{
                        id
                        shipment {{ id }}
                        box {{
                            id
                            state
                            shipmentDetail {{ id }}
                            history {{ changes }}
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                        }}
                        sourceProduct {{ id }}
                        targetProduct {{ id }}
                        sourceLocation {{ id }}
                        targetLocation {{ id }}
                        sourceSize {{ id }}
                        targetSize {{ id }}
                        sourceQuantity
                        targetQuantity
                        createdBy {{ id }}
                        createdOn
                        removedBy {{ id }}
                        removedOn
                    }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment["details"][0].pop("createdOn").startswith(today)
    assert shipment["details"][1].pop("createdOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
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
                    "shipmentDetail": {"id": prepared_shipment_detail_id},
                    "history": [
                        {"changes": f"{change_prefix} InStock to MarkedForShipment"},
                        {"changes": "created record"},
                    ],
                    "lastModifiedOn": another_marked_for_shipment_box[
                        "last_modified_on"
                    ].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                },
                "sourceProduct": {
                    "id": str(another_marked_for_shipment_box["product"])
                },
                "targetProduct": None,
                "sourceLocation": {
                    "id": str(another_marked_for_shipment_box["location"])
                },
                "targetLocation": None,
                "sourceSize": {"id": str(another_marked_for_shipment_box["size"])},
                "targetSize": None,
                "sourceQuantity": another_marked_for_shipment_box["number_of_items"],
                "targetQuantity": None,
                "createdBy": {"id": "1"},
                "removedBy": None,
                "removedOn": None,
            },
            {
                "shipment": {"id": shipment_id},
                "box": {
                    "id": str(default_box["id"]),
                    "state": BoxState.MarkedForShipment.name,
                    "shipmentDetail": {"id": shipment_detail_id},
                    "history": [
                        {"changes": f"{change_prefix} InStock to MarkedForShipment"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "removed tag 'pallet1' from box"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "created record"},
                    ],
                    "lastModifiedBy": {"id": source_base_user_id},
                },
                "sourceProduct": {"id": str(default_box["product"])},
                "targetProduct": None,
                "sourceLocation": {"id": str(default_box["location"])},
                "targetLocation": None,
                "sourceSize": {"id": str(default_box["size"])},
                "targetSize": None,
                "sourceQuantity": default_box["number_of_items"],
                "targetQuantity": None,
                "createdBy": {"id": source_base_user_id},
                "removedBy": None,
                "removedOn": None,
            },
        ],
    }

    # Verify that another_box is not added to shipment (not located in source base).
    # Same for lost_box (box state different from InStock) and default_box (already
    # added to shipment, hence box state MarkedForShipment different from InStock).
    # A box with unknown label identifier is not added either
    # Test cases 3.2.27, 3.2.28, 3.2.29
    non_existent_box = {"label_identifier": "xxx"}
    for box in [another_box, lost_box, default_box, non_existent_box]:
        box_label_identifier = box["label_identifier"]
        update_input = f"""{{ id: {shipment_id},
                    preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
        mutation = f"""mutation {{ updateShipmentWhenPreparing(
                    updateInput: {update_input}) {{
                        details {{ id }}
                    }} }}"""
        shipment = assert_successful_request(client, mutation)
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
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    id
                    state
                    details {{
                        id
                        removedOn
                        removedBy {{ id }}
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                            history {{ changes }}
                        }}
                    }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment["details"][0].pop("removedOn").startswith(today)
    assert shipment["details"][1].pop("removedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    assert len(shipment["details"][0]["box"].pop("history")) == 3
    assert len(shipment["details"][1]["box"].pop("history")) == 6
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Preparing.name,
        "details": [
            {
                "id": i,
                "removedBy": {"id": source_base_user_id},
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedBy": {"id": source_base_user_id},
                },
            }
            for i in [prepared_shipment_detail_id, shipment_detail_id]
        ],
    }
    for box in boxes:
        box_label_identifier = box["label_identifier"]
        query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                        state
                        shipmentDetail {{ id }}
        }} }}"""
        box_response = assert_successful_request(client, query)
        assert box_response == {"state": BoxState.InStock.name, "shipmentDetail": None}

    # Verify that lost_box is not removed from shipment (box state different from
    # MarkedForShipment).
    # Same for marked_for_shipment_box (not part of shipment), and non-existent box
    # Test cases 3.2.31, 3.2.32
    boxes = [lost_box, marked_for_shipment_box]
    for box in boxes + [non_existent_box]:
        box_label_identifier = box["label_identifier"]
        update_input = f"""{{ id: {shipment_id},
                    removedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
        mutation = f"""mutation {{ updateShipmentWhenPreparing(
                    updateInput: {update_input}) {{
                        details {{
                            id
                            box {{ state }}
                        }}
                    }} }}"""
        shipment = assert_successful_request(client, mutation)
        assert shipment == {
            "details": [
                {"id": i, "box": {"state": BoxState.InStock.name}}
                for i in [prepared_shipment_detail_id, shipment_detail_id]
            ]
        }
    for box in boxes:
        box_label_identifier = box["label_identifier"]
        query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                        state }} }}"""
        box_response = assert_successful_request(client, query)
        assert box_response == {"state": BoxState(box["state"]).name}

    # Add one box again, remove it, and add it again
    box_label_identifier = default_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    details {{ id box {{ state }} }} }} }}"""
    shipment = assert_successful_request(client, mutation)
    temp_shipment_detail_id = str(shipment["details"][-1].pop("id"))

    update_input = f"""{{ id: {shipment_id},
                removedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    details {{ id box {{ state }} }} }} }}"""
    assert_successful_request(client, mutation)

    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    details {{ id box {{ state }} }} }} }}"""
    shipment = assert_successful_request(client, mutation)

    newest_shipment_detail_id = str(shipment["details"][-1].pop("id"))
    assert shipment == {
        "details": [
            {
                "id": prepared_shipment_detail_id,
                "box": {"state": BoxState.InStock.name},
            },
            {
                "id": shipment_detail_id,
                # this points to the box that has been marked for shipment again
                "box": {"state": BoxState.MarkedForShipment.name},
            },
            {
                "id": temp_shipment_detail_id,
                # this points to the box that has been marked for shipment again
                "box": {"state": BoxState.MarkedForShipment.name},
            },
            {
                "box": {"state": BoxState.MarkedForShipment.name},
            },
        ]
    }

    # Test case 3.2.11
    mutation = f"""mutation {{ sendShipment(id: {shipment_id}) {{
                    id
                    state
                    sentBy {{ id }}
                    sentOn
                    details {{
                        id
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                            history {{ changes }}
                        }}
                    }} }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("sentOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][2]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][3]["box"].pop("lastModifiedOn").startswith(today)
    common_box_info = {
        "state": BoxState.InTransit.name,
        "lastModifiedBy": {"id": source_base_user_id},
        "history": [
            {"changes": f"{change_prefix} MarkedForShipment to InTransit"},
            {"changes": f"{change_prefix} InStock to MarkedForShipment"},
            {"changes": f"{change_prefix} MarkedForShipment to InStock"},
            {"changes": f"{change_prefix} InStock to MarkedForShipment"},
            {"changes": f"{change_prefix} MarkedForShipment to InStock"},
            {"changes": f"{change_prefix} InStock to MarkedForShipment"},
            {"changes": "assigned tag 'pallet1' to box"},
            {"changes": "removed tag 'pallet1' from box"},
            {"changes": "assigned tag 'pallet1' to box"},
            {"changes": "created record"},
        ],
    }
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Sent.name,
        "sentBy": {"id": source_base_user_id},
        "details": [
            # two boxes have been returned to stock
            {
                "id": prepared_shipment_detail_id,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedBy": {"id": source_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} MarkedForShipment to InStock"},
                        {"changes": f"{change_prefix} InStock to MarkedForShipment"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": shipment_detail_id,
                "box": common_box_info,
            },
            {
                "id": temp_shipment_detail_id,
                "box": common_box_info,
            },
            {
                "id": newest_shipment_detail_id,
                "box": common_box_info,
            },
        ],
    }


def test_shipment_mutations_cancel(
    client,
    mocker,
    default_shipment,
    another_marked_for_shipment_box,
    another_shipment,
    prepared_shipment_detail,
):
    # Test case 3.2.7
    shipment_id = str(default_shipment["id"])
    mutation = f"""mutation {{ cancelShipment(id: {shipment_id}) {{
                    id
                    state
                    canceledBy {{ id }}
                    canceledOn
                    details {{
                        id
                        removedOn
                        removedBy {{ id }}
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                            history {{ changes }}
                        }}
                    }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("canceledOn").startswith(today)
    assert shipment["details"][0].pop("removedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Canceled.name,
        "canceledBy": {"id": source_base_user_id},
        "details": [
            {
                "id": str(prepared_shipment_detail["id"]),
                "removedBy": {"id": source_base_user_id},
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedBy": {"id": source_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} MarkedForShipment to InStock"},
                        {"changes": f"{change_prefix} InStock to MarkedForShipment"},
                        {"changes": "created record"},
                    ],
                },
            }
        ],
    }

    identifier = another_marked_for_shipment_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{identifier}") {{
                    state
                    shipmentDetail {{ id }}
    }} }}"""
    box = assert_successful_request(client, query)
    assert box == {"state": BoxState.InStock.name, "shipmentDetail": None}

    # Shipment does not have any details assigned
    mock_user_for_request(mocker, base_ids=[3], organisation_id=2, user_id=2)
    shipment_id = str(another_shipment["id"])
    mutation = f"""mutation {{ cancelShipment(id: {shipment_id}) {{ state }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"state": ShipmentState.Canceled.name}


def test_shipment_mutations_on_target_side(
    client,
    mocker,
    mock_default_target_base_user,
    default_transfer_agreement,
    unidirectional_transfer_agreement,
    default_base,
    another_base,
    sent_shipment,
    default_shipment_detail,
    another_shipment_detail,
    removed_shipment_detail,
    another_location,
    another_product,
    another_size,
    default_product,
    default_location,
    default_box,
    in_transit_box,
    another_in_transit_box,
    tags,
):
    # Test cases 3.2.1b, 3.2.1c
    for agreement in [default_transfer_agreement, unidirectional_transfer_agreement]:
        source_base_id = str(another_base["id"])
        target_base_id = str(default_base["id"])
        agreement_id = agreement["id"]
        creation_input = f"""sourceBaseId: {source_base_id},
                             targetBaseId: {target_base_id},
                             transferAgreementId: {agreement_id}"""
        mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }})
                    {{
                        sourceBase {{ id }}
                        targetBase {{ id }}
                        state
                    }} }}"""
        shipment = assert_successful_request(client, mutation)
        assert shipment == {
            "sourceBase": {"id": source_base_id},
            "targetBase": {"id": target_base_id},
            "state": ShipmentState.Preparing.name,
        }

    target_product_id = str(another_product["id"])
    target_location_id = str(another_location["id"])
    target_size_id = str(another_size["id"])
    target_quantity = 11
    shipment_id = str(sent_shipment["id"])
    detail_id = str(default_shipment_detail["id"])
    another_detail_id = str(another_shipment_detail["id"])
    removed_detail_id = str(removed_shipment_detail["id"])
    tag_name = tags[2]["name"]

    def _create_mutation(
        *,
        detail_id,
        target_product_id,
        target_location_id,
        target_size_id,
        target_quantity,
    ):
        update_input = f"""id: {shipment_id},
                receivedShipmentDetailUpdateInputs: {{
                        id: {detail_id},
                        targetProductId: {target_product_id},
                        targetLocationId: {target_location_id}
                        targetSizeId: {target_size_id}
                        targetQuantity: {target_quantity}
                    }}"""
        return f"""mutation {{ updateShipmentWhenReceiving(
                    updateInput: {{ {update_input} }}) {{
                        id
                        state
                        completedBy {{ id }}
                        completedOn
                        details {{
                            id
                            sourceProduct {{ id }}
                            targetProduct {{ id }}
                            sourceLocation {{ id }}
                            targetLocation {{ id }}
                            targetSize {{ id }}
                            targetQuantity
                            box {{
                                state
                                lastModifiedOn
                                lastModifiedBy {{ id }}
                                history {{ changes }}
                            }}
                        }}
                    }} }}"""

    # Test case 3.2.14a
    mutation = f"""mutation {{ startReceivingShipment(id: "{shipment_id}") {{
                    id
                    state
                    receivingStartedBy {{ id }}
                    receivingStartedOn
                    details {{
                        id
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                            history {{ changes }}
                        }}
                    }} }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("receivingStartedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Receiving.name,
        "receivingStartedBy": {"id": target_base_user_id},
        "details": [
            {
                "id": detail_id,
                "box": {
                    "state": BoxState.Receiving.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} InTransit to Receiving"},
                        {"changes": f"assigned tag '{tag_name}' to box"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": another_detail_id,
                "box": {
                    "state": BoxState.Receiving.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} InTransit to Receiving"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": removed_detail_id,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedOn": default_box["last_modified_on"].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                    "history": [
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "removed tag 'pallet1' from box"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "created record"},
                    ],
                },
            },
        ],
    }

    time.sleep(1)
    # Test case 3.2.34a
    shipment = assert_successful_request(
        client,
        _create_mutation(
            detail_id=detail_id,
            target_product_id=target_product_id,
            target_location_id=target_location_id,
            target_size_id=target_size_id,
            target_quantity=target_quantity,
        ),
    )
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    expected_shipment = {
        "id": shipment_id,
        "state": ShipmentState.Receiving.name,
        "completedBy": None,
        "completedOn": None,
        "details": [
            {
                "id": detail_id,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {
                            "changes": f"{change_prefix} Receiving to InStock",
                        },
                        {
                            "changes": "changed the number of items from 10 to "
                            + f"{target_quantity}",
                        },
                        {
                            "changes": "changed size from small to "
                            + f"{another_size['label']}",
                        },
                        {
                            "changes": "changed box location from Location to "
                            + f"{another_location['name']}",
                        },
                        {
                            "changes": "changed product type from Indigestion tablets "
                            + f"to {another_product['name']}"
                        },
                        {"changes": f"removed tag '{tag_name}' from box"},
                        {"changes": f"{change_prefix} InTransit to Receiving"},
                        {"changes": f"assigned tag '{tag_name}' to box"},
                        {"changes": "created record"},
                    ],
                },
                "sourceProduct": {"id": str(default_shipment_detail["source_product"])},
                "targetProduct": {"id": target_product_id},
                "sourceLocation": {
                    "id": str(default_shipment_detail["source_location"])
                },
                "targetLocation": {"id": target_location_id},
                "targetSize": {"id": target_size_id},
                "targetQuantity": target_quantity,
            },
            {
                "id": another_detail_id,
                "box": {
                    "state": BoxState.Receiving.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} InTransit to Receiving"},
                        {"changes": "created record"},
                    ],
                },
                "sourceProduct": {"id": str(another_shipment_detail["source_product"])},
                "targetProduct": None,
                "sourceLocation": {
                    "id": str(another_shipment_detail["source_location"])
                },
                "targetLocation": None,
                "targetSize": None,
                "targetQuantity": None,
            },
            {
                "id": removed_detail_id,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedOn": default_box["last_modified_on"].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                    "history": [
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "removed tag 'pallet1' from box"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "created record"},
                    ],
                },
                "sourceProduct": {"id": str(removed_shipment_detail["source_product"])},
                "targetProduct": None,
                "sourceLocation": {
                    "id": str(removed_shipment_detail["source_location"])
                },
                "targetLocation": None,
                "targetSize": None,
                "targetQuantity": None,
            },
        ],
    }
    assert shipment == expected_shipment

    # Change state of reconciled box to Donated. The shipment should still auto-complete
    mutation = f"""mutation {{ updateBox(
                    updateInput: {{
                        labelIdentifier: "{in_transit_box['label_identifier']}"
                        state: Donated
                    }} ) {{ id }} }}"""
    assert_successful_request(client, mutation)

    # Verify that another_detail_id is not updated (invalid product)
    # Test cases 3.2.39ab
    for product in [default_product, {"id": 0}]:
        shipment = assert_bad_user_input(
            client,
            _create_mutation(
                detail_id=another_detail_id,
                target_product_id=product["id"],
                target_location_id=target_location_id,
                target_size_id=target_size_id,
                target_quantity=target_quantity,
            ),
        )

    # Verify that another_detail_id is not updated (invalid location)
    # Test cases 3.2.38ab
    for location in [default_location, {"id": 0}]:
        assert_bad_user_input(
            client,
            _create_mutation(
                detail_id=another_detail_id,
                target_product_id=target_product_id,
                target_location_id=location["id"],
                target_size_id=target_size_id,
                target_quantity=target_quantity,
            ),
        )

    # Test case 3.2.37
    assert_bad_user_input(
        client,
        _create_mutation(
            detail_id=removed_detail_id,
            target_product_id=target_product_id,
            target_location_id=target_location_id,
            target_size_id=target_size_id,
            target_quantity=target_quantity,
        ),
    )

    # Test case 3.2.40, 3.2.34b
    box_label_identifier = another_in_transit_box["label_identifier"]
    mutation = f"""mutation {{ updateShipmentWhenReceiving( updateInput: {{
                id: {shipment_id},
                lostBoxLabelIdentifiers: ["{box_label_identifier}"]
            }} ) {{
                id
                state
                completedBy {{ id }}
                completedOn
                details {{
                    id
                    removedBy {{ id }}
                    lostBy {{ id }}
                    receivedBy {{ id }}
                    box {{
                        state
                        lastModifiedOn
                        lastModifiedBy {{ id }}
                        history {{ changes }}
                    }}
                }}
            }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("completedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    # box history has been verified before; skip it for brevity
    assert shipment["details"][0]["box"].pop("history") is not None
    assert shipment == {
        "id": shipment_id,
        "state": ShipmentState.Completed.name,
        "completedBy": {"id": target_base_user_id},
        "details": [
            {
                "id": detail_id,
                "removedBy": None,
                "lostBy": None,
                "receivedBy": {"id": target_base_user_id},
                "box": {
                    "state": BoxState.Donated.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                },
            },
            {
                "id": another_detail_id,
                "removedBy": None,
                "lostBy": {"id": target_base_user_id},
                "receivedBy": None,
                "box": {
                    "state": BoxState.NotDelivered.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} Receiving to NotDelivered"},
                        {"changes": f"{change_prefix} InTransit to Receiving"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": removed_detail_id,
                "removedBy": {"id": target_base_user_id},
                "lostBy": None,
                "receivedBy": None,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedOn": default_box["last_modified_on"].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                    "history": [
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "removed tag 'pallet1' from box"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "created record"},
                    ],
                },
            },
        ],
    }
    # The box associated with default_shipment_detail
    box_label_identifier = in_transit_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                    state
                    product {{ id }}
                    location {{ id }}
                    tags {{ id }}
                    shipmentDetail {{ id }}
    }} }}"""
    box = assert_successful_request(client, query)
    assert box == {
        "state": BoxState.Donated.name,
        "product": {"id": target_product_id},
        "location": {"id": target_location_id},
        "tags": [],
        "shipmentDetail": None,
    }

    # The box is still registered in the source base, hence any user from the target
    # organisation can't access it
    mock_user_for_request(mocker)
    box_label_identifier = another_in_transit_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                    state
                    shipmentDetail {{ id }}
    }} }}"""
    box = assert_successful_request(client, query)
    assert box == {"state": BoxState.NotDelivered.name, "shipmentDetail": None}


def test_shipment_mutations_on_target_side_mark_shipment_as_lost(
    mocker,
    mock_default_target_base_user,
    client,
    default_box,
    in_transit_box,
    sent_shipment,
    default_shipment_detail,
    another_shipment_detail,
    removed_shipment_detail,
):
    shipment_id = str(sent_shipment["id"])
    mutation = f"""mutation {{ markShipmentAsLost(id: {shipment_id}) {{
                    state
                    completedOn
                    completedBy {{ id }}
                    details {{
                        id
                        removedBy {{ id }}
                        lostBy {{ id }}
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                            history {{ changes }}
                        }}
                    }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("completedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment == {
        "state": ShipmentState.Lost.name,
        "completedBy": {"id": target_base_user_id},
        "details": [
            {
                "id": str(default_shipment_detail["id"]),
                "removedBy": None,
                "lostBy": {"id": target_base_user_id},
                "box": {
                    "state": BoxState.NotDelivered.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} InTransit to NotDelivered"},
                        {"changes": "assigned tag 'tag-name' to box"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": str(another_shipment_detail["id"]),
                "removedBy": None,
                "lostBy": {"id": target_base_user_id},
                "box": {
                    "state": BoxState.NotDelivered.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                    "history": [
                        {"changes": f"{change_prefix} InTransit to NotDelivered"},
                        {"changes": "created record"},
                    ],
                },
            },
            {
                "id": str(removed_shipment_detail["id"]),
                "removedBy": {"id": target_base_user_id},
                "lostBy": None,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedOn": default_box["last_modified_on"].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                    "history": [
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "removed tag 'pallet1' from box"},
                        {"changes": "assigned tag 'pallet1' to box"},
                        {"changes": "created record"},
                    ],
                },
            },
        ],
    }

    # The box is still registered in the source base, hence any user from the target
    # organisation can't access it
    mock_user_for_request(mocker)
    box_label_identifier = in_transit_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{box_label_identifier}") {{
                    state
                    shipmentDetail {{ id }}
    }} }}"""
    box = assert_successful_request(client, query)
    assert box == {"state": BoxState.NotDelivered.name, "shipmentDetail": None}


def test_shipment_mutations_on_target_side_mark_all_boxes_as_lost(
    mock_default_target_base_user,
    client,
    default_box,
    in_transit_box,
    another_in_transit_box,
    sent_shipment,
    default_shipment_detail,
    another_shipment_detail,
    removed_shipment_detail,
):
    shipment_id = str(sent_shipment["id"])
    mutation = f"""mutation {{ startReceivingShipment(id: {shipment_id}) {{
                    state }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"state": ShipmentState.Receiving.name}

    mutation = _generate_update_shipment_mutation(
        shipment=sent_shipment,
        lost_boxes=[in_transit_box, another_in_transit_box],
    )
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"id": shipment_id}

    query = f"""query {{ shipment(id: {shipment_id}) {{
                    state
                    completedOn
                    completedBy {{ id }}
                    details {{
                        id
                        removedBy {{ id }}
                        receivedBy {{ id }}
                        lostBy {{ id }}
                        box {{
                            state
                            lastModifiedOn
                            lastModifiedBy {{ id }}
                        }}
                    }}
                }} }}"""
    shipment = assert_successful_request(client, query)
    assert shipment.pop("completedOn").startswith(today)
    assert shipment["details"][0]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment["details"][1]["box"].pop("lastModifiedOn").startswith(today)
    assert shipment == {
        "state": ShipmentState.Lost.name,
        "completedBy": {"id": target_base_user_id},
        "details": [
            {
                "id": str(default_shipment_detail["id"]),
                "removedBy": None,
                "receivedBy": None,
                "lostBy": {"id": target_base_user_id},
                "box": {
                    "state": BoxState.NotDelivered.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                },
            },
            {
                "id": str(another_shipment_detail["id"]),
                "removedBy": None,
                "receivedBy": None,
                "lostBy": {"id": target_base_user_id},
                "box": {
                    "state": BoxState.NotDelivered.name,
                    "lastModifiedBy": {"id": target_base_user_id},
                },
            },
            {
                "id": str(removed_shipment_detail["id"]),
                "removedBy": {"id": target_base_user_id},
                "receivedBy": None,
                "lostBy": None,
                "box": {
                    "state": BoxState.InStock.name,
                    "lastModifiedOn": default_box["last_modified_on"].isoformat()
                    + "+00:00",
                    "lastModifiedBy": {"id": "1"},
                },
            },
        ],
    }


def _generate_create_shipment_mutation(*, source_base, target_base, agreement=None):
    creation_input = f"""sourceBaseId: {source_base["id"]},
                         targetBaseId: {target_base["id"]} """
    if agreement is not None:
        creation_input += f"""transferAgreementId: {agreement["id"]}"""
    return f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id }} }}"""


def assert_bad_user_input_when_creating_shipment(client, **kwargs):
    mutation = _generate_create_shipment_mutation(**kwargs)
    assert_bad_user_input(client, mutation)


def _generate_update_shipment_mutation(
    *,
    shipment,
    target_base=None,
    lost_boxes=None,
    received_details=None,
    target_location=None,
    target_product=None,
    target_size=None,
    target_quantity=None,
):
    update_input = f"id: {shipment['id']}"
    update_type = "WhenPreparing"
    if target_base is not None:
        update_input += f", targetBaseId: {target_base['id']}"
    if lost_boxes is not None:
        identifiers = ",".join(f'"{b["label_identifier"]}"' for b in lost_boxes)
        update_input += f", lostBoxLabelIdentifiers: [{identifiers}]"
        update_type = "WhenReceiving"
    if received_details is not None:
        inputs = ", ".join(
            f"""{{ id: {detail["id"]},
                targetLocationId: {target_location["id"]},
                targetSizeId: {target_size["id"]},
                targetQuantity: {target_quantity}
                targetProductId: {target_product["id"]} }}"""
            for detail in received_details
        )
        update_input += f", receivedShipmentDetailUpdateInputs: [{inputs}]"
        update_type = "WhenReceiving"
    return f"""mutation {{ updateShipment{update_type}(
                updateInput: {{ {update_input} }} ) {{ id }} }}"""


def assert_bad_user_input_when_updating_shipment(client, **kwargs):
    mutation = _generate_update_shipment_mutation(**kwargs)
    assert_bad_user_input(client, mutation)


def test_shipment_mutations_create_with_non_accepted_agreement(
    read_only_client, default_base, another_base, expired_transfer_agreement
):
    # Test case 3.2.2
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        # base IDs don't matter because validation for agreement state comes first
        source_base=default_base,
        target_base=another_base,
        agreement=expired_transfer_agreement,
    )


def test_shipment_mutations_create_with_invalid_base(
    read_only_client, default_bases, default_transfer_agreement
):
    # Test case 3.2.3
    assert_bad_user_input_when_creating_shipment(
        read_only_client,
        source_base=default_bases[0],
        target_base=default_bases[3],  # not part of agreement
        agreement=default_transfer_agreement,
    )


def test_shipment_mutations_intra_org_invalid_input(read_only_client, default_bases):
    # Test case 3.2.3a
    assert_bad_user_input_when_creating_shipment(
        read_only_client, source_base=default_bases[0], target_base=default_bases[0]
    )

    # Test case 3.2.3b
    assert_bad_user_input_when_creating_shipment(
        read_only_client, source_base=default_bases[0], target_base=default_bases[2]
    )


def test_shipment_mutations_create_as_target_org_member_in_unidirectional_agreement(
    read_only_client, default_bases, unidirectional_transfer_agreement
):
    # Test case 3.2.4a
    # The default user (see auth_service fixture) is member of organisation 1 which is
    # the target organisation in the unidirectional_transfer_agreement fixture
    mutation = _generate_create_shipment_mutation(
        source_base=default_bases[2],
        target_base=default_bases[1],
        agreement=unidirectional_transfer_agreement,
    )
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_create_as_member_of_neither_org(
    read_only_client, mocker, default_transfer_agreement
):
    # Test case 3.2.4b
    mock_user_for_request(mocker, organisation_id=3, user_id=2)
    mutation = _generate_create_shipment_mutation(
        source_base={"id": 0},
        target_base={"id": 0},
        agreement=default_transfer_agreement,
    )
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_send_as_member_of_non_creating_org(
    read_only_client, another_shipment
):
    # Test case 3.2.14
    mutation = f"mutation {{ sendShipment(id: {another_shipment['id']}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_receive_as_member_of_creating_org(
    read_only_client, default_shipment
):
    # Test case 3.2.14d
    mutation = (
        f"mutation {{ startReceivingShipment(id: {default_shipment['id']}) {{ id }} }}"
    )
    assert_forbidden_request(read_only_client, mutation)


@pytest.mark.parametrize("act", ["cancel", "send"])
def test_shipment_mutations_in_non_preparing_state(
    read_only_client, canceled_shipment, act
):
    # Test cases 3.2.9, 3.2.13
    mutation = f"mutation {{ {act}Shipment(id: {canceled_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


@pytest.mark.parametrize("action", ["startReceivingShipment", "markShipmentAsLost"])
def test_shipment_mutations_receive_when_not_in_sent_state(
    read_only_client, another_shipment, action
):
    # Test case 3.2.14c
    mutation = f"mutation {{ {action}(id: {another_shipment['id']}) {{ id }} }}"
    assert_bad_user_input(read_only_client, mutation)


def test_shipment_mutations_cancel_as_member_of_neither_org(
    read_only_client, mocker, default_shipment
):
    # Test case 3.2.10
    mock_user_for_request(mocker, organisation_id=3, user_id=2, base_ids=[5])
    mutation = f"mutation {{ cancelShipment(id: {default_shipment['id']}) {{ id }} }}"
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_update_with_invalid_target_base(
    read_only_client, default_bases, default_shipment
):
    # Test case 3.2.24
    # This will use updateShipmentWhenPreparing
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        target_base=default_bases[3],  # not part of agreement
        shipment=default_shipment,
    )


def test_shipment_mutations_update_in_non_preparing_state(
    read_only_client, canceled_shipment, default_bases
):
    # Test case 3.2.23
    # This will use updateShipmentWhenPreparing
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=canceled_shipment,
        target_base=default_bases[1],
    )


def test_shipment_mutations_update_as_member_of_non_creating_org(
    read_only_client, another_shipment, default_bases
):
    # Test case 3.2.25
    # The default user (see auth_service fixture) is member of organisation 1 but
    # organisation 2 is the one that created another_shipment
    # This will use updateShipmentWhenPreparing
    mutation = _generate_update_shipment_mutation(
        shipment=another_shipment,
        target_base=default_bases[1],
    )
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_update_checked_in_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    default_shipment_detail,
    another_location,
    another_product,
    another_size,
):
    # Test case 3.2.35
    # This will use updateShipmentWhenReceiving
    mutation = _generate_update_shipment_mutation(
        shipment=sent_shipment,
        received_details=[default_shipment_detail],
        target_location=another_location,
        target_product=another_product,
        target_size=another_size,
        target_quantity=1,
    )
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_update_mark_lost_boxes_as_member_of_creating_org(
    read_only_client,
    sent_shipment,
    marked_for_shipment_box,
):
    # Test case 3.2.41
    # This will use updateShipmentWhenReceiving
    mutation = _generate_update_shipment_mutation(
        shipment=sent_shipment,
        lost_boxes=[marked_for_shipment_box],
    )
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_update_without_arguments(
    read_only_client, default_shipment
):
    # Test case 3.2.33
    mutation = _generate_update_shipment_mutation(shipment=default_shipment)
    shipment = assert_successful_request(read_only_client, mutation)
    assert shipment == {"id": str(default_shipment["id"])}


def test_shipment_mutations_update_checked_in_boxes_when_shipment_in_non_sent_state(
    read_only_client,
    mock_default_target_base_user,
    default_shipment,
    prepared_shipment_detail,
    another_location,
    another_product,
    another_size,
):
    # Test case 3.2.36
    # This will use updateShipmentWhenReceiving
    assert_bad_user_input_when_updating_shipment(
        read_only_client,
        shipment=default_shipment,
        received_details=[prepared_shipment_detail],
        target_location=another_location,
        target_product=another_product,
        target_size=another_size,
        target_quantity=1,
    )


def test_shipment_mutations_create_non_existent_resource(
    read_only_client, default_base, another_base
):
    # Test case 3.2.5
    mutation = _generate_create_shipment_mutation(
        source_base=default_base,
        target_base=another_base,
        agreement={"id": 0},
    )
    assert_bad_user_input(read_only_client, mutation)


def _create_move_not_delivered_boxes_in_stock_mutation(box_id):
    return f"""mutation {{ moveNotDeliveredBoxesInStock(
                    boxIds: ["{box_id}"]) {{
                        id
                        state
                        completedOn
                        completedBy {{ id }}
                        details {{
                            removedOn
                            removedBy {{ id }}
                            lostOn
                            lostBy {{ id }}
                            box {{ id state shipmentDetail {{ id }} }}
                        }} }} }}"""


def test_move_not_delivered_box_instock_in_source_base(
    client,
    not_delivered_box,
    another_not_delivered_box,
    another_box,
    completed_shipment,
    receiving_shipment,
):
    # The shipment was already Completed. Now the source side finds a box that was
    # added to the shipment but then only physically (not digitally) removed before
    # sending.
    # The shipment remains Completed but the box is InStock instead of NotDelivered
    box_id = str(another_not_delivered_box["id"])
    mutation = _create_move_not_delivered_boxes_in_stock_mutation(box_id)
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("completedOn").startswith(today)
    assert shipment["details"][0].pop("removedOn").startswith(today)
    assert shipment == {
        "id": str(completed_shipment["id"]),
        "completedBy": {"id": "1"},
        "state": ShipmentState.Completed.name,
        "details": [
            {
                "removedBy": {"id": source_base_user_id},
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": box_id,
                    "state": BoxState.InStock.name,
                    "shipmentDetail": None,
                },
            },
            {
                "removedOn": None,
                "removedBy": None,
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": str(another_box["id"]),
                    "state": BoxState.InStock.name,
                    "shipmentDetail": {"id": "8"},
                },
            },
        ],
    }

    # The shipment is Receiving. Now the source side finds a box that was added to the
    # shipment but then only physically (not digitally) removed before sending.
    # The shipment becomes Completed and the box is InStock instead of NotDelivered
    box_id = str(not_delivered_box["id"])
    mutation = _create_move_not_delivered_boxes_in_stock_mutation(box_id)
    shipment = assert_successful_request(client, mutation)
    assert shipment.pop("completedOn").startswith(today)
    assert shipment["details"][0].pop("removedOn").startswith(today)
    assert shipment == {
        "id": str(receiving_shipment["id"]),
        "completedBy": {"id": source_base_user_id},
        "state": ShipmentState.Completed.name,
        "details": [
            {
                "removedBy": {"id": source_base_user_id},
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": box_id,
                    "state": BoxState.InStock.name,
                    "shipmentDetail": None,
                },
            },
        ],
    }

    label_identifier = not_delivered_box["label_identifier"]
    query = f"""query {{ box(labelIdentifier: "{label_identifier}") {{
            history {{ changes }} }} }}"""
    box = assert_successful_request(client, query)
    assert box == {
        "history": [
            {"changes": f"{change_prefix} NotDelivered to InStock"},
            {"changes": "created record"},
        ]
    }


def test_move_not_delivered_box_instock_in_target_base(
    client,
    mock_default_target_base_user,
    not_delivered_box,
    another_not_delivered_box,
    another_box,
    receiving_shipment,
    completed_shipment,
):
    # The shipment is Receiving. Person A on the target side has extracted a box from
    # the shipment without registering. Person B on the target side can't find the box
    # and marks it as NotDelivered. The target side finds the box again.
    # The shipment stays Receiving and the box is Receiving instead of NotDelivered
    box_id = str(not_delivered_box["id"])
    mutation = _create_move_not_delivered_boxes_in_stock_mutation(box_id)
    shipment = assert_successful_request(client, mutation)
    assert shipment == {
        "id": str(receiving_shipment["id"]),
        "completedOn": None,
        "completedBy": None,
        "state": ShipmentState.Receiving.name,
        "details": [
            {
                "removedOn": None,
                "removedBy": None,
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": box_id,
                    "state": BoxState.Receiving.name,
                    "shipmentDetail": {"id": "6"},
                },
            },
        ],
    }

    # The shipment is Completed. Person A on the target side has extracted a box from
    # the shipment without registering. Person B on the target side can't find the box
    # and marks it as NotDelivered. The target side finds the box again.
    # The shipment becomes Receiving and the box is Receiving instead of NotDelivered
    box_id = str(another_not_delivered_box["id"])
    mutation = _create_move_not_delivered_boxes_in_stock_mutation(box_id)
    shipment = assert_successful_request(client, mutation)
    assert shipment == {
        "id": str(completed_shipment["id"]),
        "completedOn": None,
        "completedBy": None,
        "state": ShipmentState.Receiving.name,
        "details": [
            {
                "removedOn": None,
                "removedBy": None,
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": box_id,
                    "state": BoxState.Receiving.name,
                    "shipmentDetail": {"id": "7"},
                },
            },
            {
                "removedOn": None,
                "removedBy": None,
                "lostOn": None,
                "lostBy": None,
                "box": {
                    "id": str(another_box["id"]),
                    "state": BoxState.InStock.name,
                    "shipmentDetail": {"id": "8"},
                },
            },
        ],
    }


def test_move_not_delivered_box_as_member_of_neither_org(
    read_only_client,
    mocker,
    not_delivered_box,
):
    mock_user_for_request(mocker, base_ids=[4], organisation_id=2, user_id=3)
    box_id = str(not_delivered_box["id"])
    mutation = _create_move_not_delivered_boxes_in_stock_mutation(box_id)
    assert_forbidden_request(read_only_client, mutation)


def test_shipment_mutations_intra_org(
    client,
    default_bases,
    default_organisation,
    default_box,
    mocker,
):
    # Test case 3.2.1a
    source_base_id = default_bases[0]["id"]
    target_base_id = default_bases[1]["id"]
    creation_input = f"""sourceBaseId: {source_base_id}
                         targetBaseId: {target_base_id}"""
    mutation = f"""mutation {{ createShipment(creationInput: {{ {creation_input} }} ) {{
                    id
                    sourceBase {{ id }}
                    targetBase {{ id }}
                    state
                    startedBy {{ id }}
                    startedOn
                    sentBy {{ id }}
                    sentOn
                    receivingStartedBy {{ id }}
                    receivingStartedOn
                    completedBy {{ id }}
                    completedOn
                    canceledBy {{ id }}
                    canceledOn
                    transferAgreement {{ id }}
                    details {{ id }}
                }} }}"""
    shipment = assert_successful_request(client, mutation)
    shipment_id = str(shipment.pop("id"))
    assert shipment.pop("startedOn").startswith(today)
    assert shipment == {
        "sourceBase": {"id": str(source_base_id)},
        "targetBase": {"id": str(target_base_id)},
        "state": ShipmentState.Preparing.name,
        "startedBy": {"id": source_base_user_id},
        "sentBy": None,
        "sentOn": None,
        "receivingStartedBy": None,
        "receivingStartedOn": None,
        "completedBy": None,
        "completedOn": None,
        "canceledBy": None,
        "canceledOn": None,
        "transferAgreement": None,
        "details": [],
    }

    box_label_identifier = default_box["label_identifier"]
    update_input = f"""{{ id: {shipment_id},
                preparedBoxLabelIdentifiers: ["{box_label_identifier}"] }}"""
    mutation = f"""mutation {{ updateShipmentWhenPreparing(
                updateInput: {update_input}) {{
                    id
                    details {{
                        id
                        shipment {{ id }}
                        box {{ id state }}
                    }} }} }}"""

    mutation = f"""mutation {{ sendShipment(id: {shipment_id}) {{
                    state }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"state": ShipmentState.Sent.name}

    # Receiving-side mutations
    mock_user_for_request(
        mocker,
        base_ids=[default_bases[1]["id"]],
        organisation_id=default_organisation["id"],
        user_id=target_base_user_id,
    )
    mutation = f"""mutation {{ startReceivingShipment(id: "{shipment_id}") {{
                    state }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"state": ShipmentState.Receiving.name}

    # No products/locations for base 2 in test data; skipping until measure-product PR
    # merged
    mutation = f"""mutation {{ updateShipmentWhenReceiving(
                updateInput: {{ id: {shipment_id} }}) {{
                    state }} }}"""
    shipment = assert_successful_request(client, mutation)
    assert shipment == {"state": ShipmentState.Completed.name}
