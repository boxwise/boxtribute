import pytest


@pytest.mark.usefixtures("default_qr_code")
def test_qr_exists(client, default_qr_code):
    code = default_qr_code["code"]
    graph_ql_query_string = f"""query CheckQrExistence {{
                qrExists(qr_code: "{code}")
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qrExists"]

    graph_ql_query_string = """query CheckQrExistence {
                qrExists(qr_code: "111")
            }"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert not response.json["data"]["qrExists"]


@pytest.mark.usefixtures("default_qr_code")
def test_qr_code(client, default_qr_code):
    graph_ql_query_string = f"""query {{
                qrCode(id: {default_qr_code['id']}) {{
                    code
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    queried_code = response.json["data"]["qrCode"]
    assert response.status_code == 200
    assert queried_code["code"] == default_qr_code["code"]
