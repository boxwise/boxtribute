import pytest


@pytest.mark.usefixtures("default_qr_code")
def test_qr_exists(client, default_qr_code):
    code = default_qr_code["code"]
    graph_ql_query_string = f"""query CheckQrExistence {{
                qrExists(qrCode: "{code}")
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qrExists"]

    graph_ql_query_string = """query CheckQrExistence {
                qrExists(qrCode: "111")
            }"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert not response.json["data"]["qrExists"]


@pytest.mark.usefixtures("default_qr_code")
def test_qr_code(client, default_qr_code):
    graph_ql_query_string = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    code
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    queried_code = response.json["data"]["qrCode"]
    assert response.status_code == 200
    assert queried_code["code"] == default_qr_code["code"]


@pytest.mark.usefixtures("qr_code_without_box")
def test_code_not_associated_with_box(client, qr_code_without_box):
    code = qr_code_without_box["code"]
    graph_ql_query_string = f"""query {{
                qrCode(qrCode: "{code}") {{
                    box {{
                        id
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert (
        "<Model: Box> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert queried_box is None


def test_code_does_not_exist(client):
    graph_ql_query_string = """query Box {
                qrCode(qrCode: "-1") {
                    id
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_code = response_data.json["data"]["qrCode"]
    assert (
        "<Model: QRCode> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    assert queried_code is None
