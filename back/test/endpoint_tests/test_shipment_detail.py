from auth import create_jwt_payload
from boxtribute_server.enums import BoxState
from utils import assert_bad_user_input


def test_shipment_detail_mutations(
    client, mocker, default_shipment_detail, another_location, another_product
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )

    target_product_id = str(another_product["id"])
    target_location_id = str(another_location["id"])
    detail_id = str(default_shipment_detail["id"])
    update_input = f"""id: {detail_id},
                    targetProductId: {target_product_id},
                    targetLocationId: {target_location_id}"""
    mutation = f"""mutation {{ updateShipmentDetail(updateInput: {{ {update_input} }})
                {{
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
                    shipment {{
                        id
                    }}
                }} }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    detail = response.json["data"]["updateShipmentDetail"]

    assert detail == {
        "id": detail_id,
        "targetProduct": {"id": target_product_id},
        "targetLocation": {"id": target_location_id},
        "box": {"state": BoxState.Received.name},
        "shipment": {"id": str(default_shipment_detail["shipment"])},
    }


def assert_bad_user_input_when_updating_shipment_detail(
    client, *, detail_id, target_location_id=None, target_product_id=None
):
    update_input = f"id: {detail_id}"
    if target_location_id is not None:
        update_input += f", targetLocationId: {target_location_id}"
    if target_product_id is not None:
        update_input += f", targetProductId: {target_product_id}"
    mutation = f"""mutation {{ updateShipmentDetail(updateInput: {{ {update_input} }})
                {{ id }} }}"""
    assert_bad_user_input(client, mutation)


def test_shipment_detail_mutations_update_checked_in_boxes_as_member_of_creating_org(
    read_only_client, default_shipment_detail
):
    assert_bad_user_input_when_updating_shipment_detail(
        read_only_client, detail_id=default_shipment_detail["id"]
    )


def test_shipment_detail_mutations_update_shipment_in_non_sent_state(
    read_only_client, mocker, prepared_shipment_detail
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
    assert_bad_user_input_when_updating_shipment_detail(
        read_only_client, detail_id=prepared_shipment_detail["id"]
    )


def test_shipment_detail_mutations_update_invalid_location(
    read_only_client, mocker, default_shipment_detail, default_location
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
    assert_bad_user_input_when_updating_shipment_detail(
        read_only_client,
        detail_id=default_shipment_detail["id"],
        target_location_id=default_location["id"],
    )


def test_shipment_detail_mutations_update_invalid_product(
    read_only_client, mocker, default_shipment_detail, default_product
):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        base_ids=[3], organisation_id=2, user_id=2
    )
    assert_bad_user_input_when_updating_shipment_detail(
        read_only_client,
        detail_id=default_shipment_detail["id"],
        target_product_id=default_product["id"],
    )
