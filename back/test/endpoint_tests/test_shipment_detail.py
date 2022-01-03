from boxtribute_server.enums import BoxState


def test_shipment_detail_mutations(
    client, default_shipment_detail, another_location, another_product
):
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
