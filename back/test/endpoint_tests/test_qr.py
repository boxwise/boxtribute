def test_qr_exists_query(read_only_client, default_qr_code):
    code = default_qr_code["code"]
    graph_ql_query_string = f"""query CheckQrExistence {{
                qrExists(qrCode: "{code}")
            }}"""
    data = {"query": graph_ql_query_string}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qrExists"]

    graph_ql_query_string = """query CheckQrExistence {
                qrExists(qrCode: "111")
            }"""
    data = {"query": graph_ql_query_string}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert not response.json["data"]["qrExists"]


def test_qr_code_query(read_only_client, default_box, default_qr_code):
    code = default_qr_code["code"]
    query = f"""query {{
                qrCode(qrCode: "{code}") {{
                    id
                    code
                    box {{
                        id
                    }}
                    createdOn
                }}
            }}"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    queried_code = response.json["data"]["qrCode"]
    assert response.status_code == 200
    assert queried_code == {
        "id": str(default_qr_code["id"]),
        "code": code,
        "box": {"id": str(default_box["id"])},
        "createdOn": None,
    }


def test_code_not_associated_with_box(read_only_client, qr_code_without_box):
    code = qr_code_without_box["code"]
    graph_ql_query_string = f"""query {{
                qrCode(qrCode: "{code}") {{
                    box {{
                        id
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = read_only_client.post("/graphql", json=data)
    assert (
        "<Model: Box> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    queried_box = response_data.json["data"]["qrCode"]["box"]
    assert queried_box is None


def test_code_does_not_exist(read_only_client):
    graph_ql_query_string = """query {
                qrCode(qrCode: "-1") {
                    id
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = read_only_client.post("/graphql", json=data)
    queried_code = response_data.json["data"]["qrCode"]
    assert (
        "<Model: QrCode> instance matching query does not exist"
        in response_data.json["errors"][0]["message"]
    )
    assert queried_code is None


def test_qr_code_mutation(client, box_without_qr_code):
    data = {"query": "mutation { createQrCode { id } }"}
    response = client.post("/graphql", json=data)
    qr_code_id = int(response.json["data"]["createQrCode"]["id"])
    assert response.status_code == 200
    assert qr_code_id > 2

    data = {
        "query": f"""mutation {{
        createQrCode(boxLabelIdentifier: "{box_without_qr_code['label_identifier']}")
        {{
            id
            box {{
                id
                items
            }}
        }}
    }}"""
    }
    response = client.post("/graphql", json=data)
    created_qr_code = response.json["data"]["createQrCode"]
    assert response.status_code == 200
    assert int(created_qr_code["id"]) == qr_code_id + 1
    assert created_qr_code["box"]["items"] == box_without_qr_code["items"]
    assert int(created_qr_code["box"]["id"]) == box_without_qr_code["id"]

    data = {"query": """mutation { createQrCode(boxLabelIdentifier: "xxx") { id } }"""}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["createQrCode"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
