import pytest
from auth import create_jwt_payload


@pytest.mark.usefixtures("default_box")
@pytest.mark.usefixtures("default_user")
def test_get_box_from_box_label_identifier(client, default_box, default_user):
    graph_ql_query_string = f"""query {{
                box(boxLabelIdentifier: "{default_box['box_label_identifier']}") {{
                    boxLabelIdentifier
                    createdBy {{
                        name
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box["boxLabelIdentifier"] == default_box["box_label_identifier"]
    assert queried_box["createdBy"]["name"] == default_user["name"]


@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("default_box")
def test_get_box_from_code(client, default_box, default_qr_code):
    graph_ql_query_string = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    box {{
                        boxLabelIdentifier
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert response_data.status_code == 200
    assert queried_box["boxLabelIdentifier"] == default_box["box_label_identifier"]


def test_invalid_permission(unauthorized_client):
    # verify missing stock:read permission
    data = {"query": """query { box(boxLabelIdentifier: "c0ffee") { id } }"""}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["box"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"

    # verify missing stock:write permission
    data = {
        "query": """mutation {
            createBox(
                boxCreationInput : {
                    productId: 1,
                    items: 9999,
                    locationId: 1,
                    comment: ""
                }) {
                id
            }
        }"""
    }
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["createBox"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"

    data = {
        "query": """mutation {
            updateBox(
                boxUpdateInput : {
                    boxLabelIdentifier: "f00b45",
                    comment: "let's try"
                }) {
                id
            }
        }"""
    }
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["updateBox"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


def test_invalid_permission_for_location_boxes(client, mocker):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["location:read"]
    )
    data = {"query": "query { location(id: 1) { boxes { id } } }"}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["location"] == {"boxes": None}
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


def test_invalid_permission_for_qr_code_box(client, mocker, default_qr_code):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["qr:read"]
    )
    code = default_qr_code["code"]
    data = {"query": f"""query {{ qrCode(qrCode: "{code}") {{ box {{ id }} }} }}"""}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qrCode"] == {"box": None}
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
