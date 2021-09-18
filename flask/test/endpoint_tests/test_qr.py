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
