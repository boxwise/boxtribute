from utils import assert_bad_user_input, assert_successful_request


def test_qr_exists_query(read_only_client, default_qr_code):
    code = default_qr_code["code"]
    query = f"""query CheckQrExistence {{
                qrExists(qrCode: "{code}")
            }}"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert qr_exists

    query = """query CheckQrExistence {
                qrExists(qrCode: "111")
            }"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert not qr_exists


def test_qr_code_query(read_only_client, default_box, default_qr_code):
    code = default_qr_code["code"]
    query = f"""query {{
                qrCode(qrCode: "{code}") {{
                    id
                    code
                    box {{ id }}
                    createdOn
                }}
            }}"""
    queried_code = assert_successful_request(read_only_client, query)
    assert queried_code == {
        "id": str(default_qr_code["id"]),
        "code": code,
        "box": {"id": str(default_box["id"])},
        "createdOn": None,
    }


def test_code_not_associated_with_box(read_only_client, qr_code_without_box):
    code = qr_code_without_box["code"]
    query = f"""query {{ qrCode(qrCode: "{code}") {{ box {{ id }} }} }}"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    assert (
        "<Model: Box> instance matching query does not exist"
        in response.json["errors"][0]["message"]
    )
    queried_box = response.json["data"]["qrCode"]["box"]
    assert queried_box is None


def test_code_does_not_exist(read_only_client):
    query = """query { qrCode(qrCode: "-1") { id } }"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    queried_code = response.json["data"]["qrCode"]
    assert (
        "<Model: QrCode> instance matching query does not exist"
        in response.json["errors"][0]["message"]
    )
    assert queried_code is None


def test_qr_code_mutation(client, box_without_qr_code):
    mutation = "mutation { createQrCode { id } }"
    qr_code = assert_successful_request(client, mutation)
    qr_code_id = int(qr_code["id"])
    assert qr_code_id > 2

    mutation = f"""mutation {{
        createQrCode(boxLabelIdentifier: "{box_without_qr_code['label_identifier']}")
        {{
            id
            box {{
                id
                items
            }}
        }}
    }}"""
    created_qr_code = assert_successful_request(client, mutation)
    assert int(created_qr_code["id"]) == qr_code_id + 1
    assert created_qr_code["box"]["items"] == box_without_qr_code["items"]
    assert int(created_qr_code["box"]["id"]) == box_without_qr_code["id"]

    assert_bad_user_input(
        client, """mutation { createQrCode(boxLabelIdentifier: "xxx") { id } }"""
    )
