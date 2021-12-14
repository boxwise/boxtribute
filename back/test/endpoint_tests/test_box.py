from boxtribute_server.enums import BoxState


def test_box_query(
    client,
    default_box,
    default_box_state,
    default_location,
    default_product,
    default_qr_code,
    default_user,
):
    # Get box from label identifier
    label_identifier = default_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    id
                    labelIdentifier
                    location {{
                        id
                    }}
                    items
                    product {{
                        id
                    }}
                    size
                    state
                    qrCode {{
                        id
                    }}
                    createdBy {{
                        name
                    }}
                    comment
                }}
            }}"""
    data = {"query": query}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box == {
        "id": str(default_box["id"]),
        "labelIdentifier": label_identifier,
        "location": {"id": str(default_location["id"])},
        "items": default_box["items"],
        "product": {"id": str(default_product["id"])},
        "size": None,
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_qr_code["id"])},
        "createdBy": {"name": default_user["name"]},
        "comment": default_box["comment"],
    }

    # Get box from QR code
    query = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    box {{
                        labelIdentifier
                    }}
                }}
            }}"""
    data = {"query": query}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert response_data.status_code == 200
    assert queried_box["labelIdentifier"] == default_box["label_identifier"]
