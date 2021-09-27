import pytest


@pytest.mark.usefixtures("qr_code_without_box")
def test_create_box(client, qr_code_without_box):
    box_creation_input_string = f"""{{
                    productId: 1,
                    items: 9999,
                    locationId: 1,
                    comment: "",
                    sizeId: 1,
                    qrCode: "{qr_code_without_box["code"]}",
                    createdBy: "1"
                }}"""

    gql_mutation_string = f"""mutation {{
            createBox(
                boxCreationInput : {box_creation_input_string}
            ) {{
                id
                boxLabelIdentifier
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
                    lastModifiedBy: "2",
                    boxLabelIdentifier: "{created_box["boxLabelIdentifier"]}"
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
    assert updated_box["lastModifiedOn"] != updated_box["createdOn"]
    assert updated_box["qrCode"] == created_box["qrCode"]
