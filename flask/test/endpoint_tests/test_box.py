import pytest

@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("default_box")
def test_get_box_from_code(client, default_box, default_qr_code):
    code = '"%s"' % default_qr_code["code"]
    graph_ql_query_string = f"""query Box {{
                box(qr_code: {code}) {{
                    box_id
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert response_data.status_code == 200
    assert queried_box["box_id"] == default_box["box_id"]


@pytest.mark.usefixtures("qr_code_without_box")
def test_code_not_associated_with_box(client, qr_code_without_box):
    code = '"%s"' % qr_code_without_box["code"]
    graph_ql_query_string = f"""query Box {{
                box(qr_code: {code}) {{
                    box_id
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert "<Model: Box> instance matching query does not exist" in response_data.json["errors"][0]["message"]
    assert queried_box == None


def test_code_does_not_exist(client):
    code = '"-1"'
    graph_ql_query_string = f"""query Box {{
                box(qr_code: {code}) {{
                    box_id
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["box"]
    assert "<Model: QRCode> instance matching query does not exist" in response_data.json["errors"][0]["message"]
    assert queried_box == None