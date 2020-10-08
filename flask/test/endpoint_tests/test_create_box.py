from boxwise_flask.db import db
from boxwise_flask.models.qr_code import QRCode


def test_create_box(client):
    """Verify base GraphQL query endpoint"""
    mock_qr = {"id": 42, "code": "999"}

    db.connect_db()
    QRCode.create(**mock_qr)
    db.close_db(None)
    box_creation_input_string = f"""{{
                    product_id: 1,
                    items: 9999,
                    location_id: 100000005,
                    comments: "",
                    size_id: 1,
                    qr_barcode: "{mock_qr["code"]}",
                    created_by: "1"
                }}"""

    # TODO: add location, product and qr to the responses for this
    gql_mutation_string = f"""mutation {{
            createBox(
                box_creation_input : {box_creation_input_string}
            ) {{
                id
            }}
        }}"""

    data = {"query": gql_mutation_string}
    response_data = client.post("/graphql", json=data)
    # TODO: fix this test
    created_box = response_data.json["data"]["createBox"]

    assert response_data.status_code == 200
    print(created_box)
