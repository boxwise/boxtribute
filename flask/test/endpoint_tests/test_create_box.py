import pytest


@pytest.mark.usefixtures("default_qr_code")
def test_create_box(client, default_qr_code):
    """Verify base GraphQL query endpoint"""
    box_creation_input_string = f"""{{
                    product_id: 1,
                    items: 9999,
                    location_id: 100000005,
                    comments: "",
                    size_id: 1,
                    qr_barcode: "{default_qr_code["code"]}",
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
