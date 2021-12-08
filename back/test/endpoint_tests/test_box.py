import pytest


@pytest.mark.usefixtures("default_box")
@pytest.mark.usefixtures("default_user")
def test_get_box_from_box_label_identifier(client, default_box, default_user):
    graph_ql_query_string = f"""query {{
                box(labelIdentifier: "{default_box['label_identifier']}") {{
                    labelIdentifier
                    createdBy {{
                        name
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box["labelIdentifier"] == default_box["label_identifier"]
    assert queried_box["createdBy"]["name"] == default_user["name"]


@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("default_box")
def test_get_box_from_code(client, default_box, default_qr_code):
    graph_ql_query_string = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    box {{
                        labelIdentifier
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert response_data.status_code == 200
    assert queried_box["labelIdentifier"] == default_box["label_identifier"]
