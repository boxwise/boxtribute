import pytest


@pytest.mark.usefixtures("qr_code_without_box")
def test_create_box(client, qr_code_without_box):
    """Verify base GraphQL query endpoint"""
    box_creation_input_string = f"""{{
                    product_id: 1,
                    items: 9999,
                    location_id: 100000005,
                    comment: "",
                    size_id: 1,
                    qr_barcode: "{qr_code_without_box["code"]}",
                    created_by: "1"
                }}"""

    # TODO: add location, product and qr to the responses for this
    gql_mutation_string = f"""mutation {{
            createBox(
                box_creation_input : {box_creation_input_string}
            ) {{
                id
                items
            }}
        }}"""

    data = {"query": gql_mutation_string}
    response_data = client.post("/graphql", json=data)
    # TODO: fix this test
    created_box = response_data.json["data"]["createBox"]

    assert response_data.status_code == 200
    assert created_box["items"] == 9999
