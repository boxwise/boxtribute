from utils import assert_bad_user_input, assert_successful_request


def test_qr_exists_query(read_only_client, default_qr_code):
    # Test case 8.1.33
    code = default_qr_code["code"]
    query = f"""query CheckQrExistence {{
                qrExists(qrCode: "{code}")
            }}"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert qr_exists

    # Test case 8.1.34
    query = """query CheckQrExistence {
                qrExists(qrCode: "000")
            }"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert not qr_exists


def test_qr_code_query(read_only_client, default_box, default_qr_code):
    # Test case 8.1.30
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
    # Test case 8.1.2a
    code = qr_code_without_box["code"]
    query = f"""query {{ qrCode(qrCode: "{code}") {{ box {{ id }} }} }}"""
    response = assert_bad_user_input(read_only_client, query, value={"box": None})
    assert "SQL" not in response.json["errors"][0]["message"]


def test_qr_code_mutation(client, box_without_qr_code):
    # Test case 8.2.30
    mutation = "mutation { createQrCode { id } }"
    qr_code = assert_successful_request(client, mutation)
    qr_code_id = int(qr_code["id"])
    assert qr_code_id > 2

    # Test case 8.2.31
    mutation = f"""mutation {{
        createQrCode(boxLabelIdentifier: "{box_without_qr_code['label_identifier']}")
        {{
            id
            box {{
                id
                numberOfItems
            }}
        }}
    }}"""
    created_qr_code = assert_successful_request(client, mutation)
    assert int(created_qr_code["id"]) == qr_code_id + 1
    assert (
        created_qr_code["box"]["numberOfItems"]
        == box_without_qr_code["number_of_items"]
    )
    assert int(created_qr_code["box"]["id"]) == box_without_qr_code["id"]

    # Test case 8.2.32
    assert_bad_user_input(
        client, """mutation { createQrCode(boxLabelIdentifier: "xxx") { id } }"""
    )
