from boxtribute_server.enums import BoxState


def test_box_query_by_label_identifier(
    read_only_client,
    default_box,
):
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
                        id
                    }}
                    comment
                }}
            }}"""
    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box == {
        "id": str(default_box["id"]),
        "labelIdentifier": label_identifier,
        "location": {"id": str(default_box["location"])},
        "items": default_box["items"],
        "product": {"id": str(default_box["product"])},
        "size": None,
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_box["qr_code"])},
        "createdBy": {"id": str(default_box["created_by"])},
        "comment": default_box["comment"],
    }


def test_box_query_by_qr_code(read_only_client, default_box, default_qr_code):
    query = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    box {{
                        labelIdentifier
                    }}
                }}
            }}"""
    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert response_data.status_code == 200
    assert queried_box["labelIdentifier"] == default_box["label_identifier"]


def test_box_mutations(client, qr_code_without_box):
    box_creation_input_string = f"""{{
                    productId: 1,
                    items: 9999,
                    locationId: 1,
                    comment: "",
                    sizeId: 1,
                    qrCode: "{qr_code_without_box["code"]}",
                }}"""

    gql_mutation_string = f"""mutation {{
            createBox(
                boxCreationInput : {box_creation_input_string}
            ) {{
                id
                labelIdentifier
                items
                location {{
                    id
                }}
                product {{
                    id
                }}
                qrCode {{
                    id
                }}
                state
                createdOn
                createdBy {{
                    id
                }}
                lastModifiedOn
                lastModifiedBy {{
                    id
                }}
            }}
        }}"""

    data = {"query": gql_mutation_string}
    response = client.post("/graphql", json=data)
    created_box = response.json["data"]["createBox"]

    assert response.status_code == 200
    assert created_box["items"] == 9999
    assert created_box["state"] == "InStock"
    assert created_box["location"]["id"] == "1"
    assert created_box["product"]["id"] == "1"
    assert created_box["qrCode"]["id"] == str(qr_code_without_box["id"])
    assert created_box["createdOn"] == created_box["lastModifiedOn"]
    assert created_box["createdBy"] == created_box["lastModifiedBy"]

    mutation = f"""mutation {{
            updateBox(
                boxUpdateInput : {{
                    items: 7777,
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                }} ) {{
                items
                lastModifiedOn
                createdOn
                qrCode {{
                    id
                }}
            }}
        }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    updated_box = response.json["data"]["updateBox"]

    assert response.status_code == 200
    assert updated_box["items"] == 7777
    assert updated_box["qrCode"] == created_box["qrCode"]
