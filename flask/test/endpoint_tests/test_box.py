import pytest


@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("default_box")
def test_get_box_from_code(client, default_box, default_qr_code):
    code = default_qr_code["code"]
    graph_ql_query_string = f"""query Box {{
                getBoxDetails(qr_code: "{code}") {{
                    ID
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["getBoxDetails"]
    assert response_data.status_code == 200
    assert queried_box["ID"] == default_box["box_id"]


@pytest.mark.usefixtures("qr_code_without_box")
def test_code_not_associated_with_box(client, qr_code_without_box):
    code = qr_code_without_box["code"]
    graph_ql_query_string = f"""query Box {{
                getBoxDetails(qr_code: "{code}") {{
                    ID
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["getBoxDetails"]
    assert (
        "<Model: Box> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    assert queried_box is None


def test_code_does_not_exist(client):
    graph_ql_query_string = """query Box {
                getBoxDetails(qr_code: "-1") {
                    ID
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_box = response_data.json["data"]["getBoxDetails"]
    assert (
        "<Model: QRCode> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    assert queried_box is None


@pytest.mark.usefixtures("default_qr_code")
@pytest.mark.usefixtures("qr_code_without_box")
def test_qr_box_exists(client, default_qr_code, qr_code_without_box):
    code = default_qr_code["code"]
    graph_ql_query_string = f"""query CheckQrExistence {{
                qrBoxExists(qr_code: "{code}")
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qrBoxExists"]

    code = qr_code_without_box["code"]
    graph_ql_query_string = f"""query CheckQrExistence {{
                qrBoxExists(qr_code: "{code}")
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert not response.json["data"]["qrBoxExists"]
