import pytest


@pytest.mark.usefixtures("default_box")
def test_get_box_from_box_label_identifier(client, default_box):
    graph_ql_query_string = f"""query {{
                box(boxId: "{default_box['box_label_identifier']}") {{
                    boxLabelIdentifier
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box["boxLabelIdentifier"] == default_box["box_label_identifier"]


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
