from datetime import date

from boxtribute_server.models.definitions.history import DbChangeHistory
from utils import assert_bad_user_input, assert_successful_request


def test_qr_exists_query(read_only_client, default_qr_code):
    # Test case 8.1.33
    code = default_qr_code["code"]
    query = f"""query CheckQrExistence {{
                qrExists(code: "{code}")
            }}"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert qr_exists

    # Test case 8.1.34
    query = """query CheckQrExistence {
                qrExists(code: "000")
            }"""
    qr_exists = assert_successful_request(read_only_client, query)
    assert not qr_exists


def test_qr_code_query(read_only_client, default_box, default_qr_code):
    # Test case 8.1.30
    code = default_qr_code["code"]
    query = f"""query {{
                qrCode(code: "{code}") {{ ...on QrCode {{
                    id
                    code
                    box {{ ...on Box {{ id }} }}
                    createdOn
                }} }}
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
    query = f"""query {{ qrCode(code: "{code}") {{
        ...on QrCode {{ box {{ ...on Box {{ id }} }} }} }} }}"""
    qr_code = assert_successful_request(read_only_client, query)
    assert qr_code == {"box": None}


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
            box {{ ...on Box {{
                id
                numberOfItems
                history {{ changes }}
            }} }}
        }}
    }}"""
    created_qr_code = assert_successful_request(client, mutation)
    assert created_qr_code == {
        "id": str(qr_code_id + 1),
        "box": {
            "id": str(box_without_qr_code["id"]),
            "numberOfItems": box_without_qr_code["number_of_items"],
            "history": [
                {"changes": "created QR code label for box"},
                {"changes": "created record"},
            ],
        },
    }

    # Test case 8.2.32
    assert_bad_user_input(
        client, """mutation { createQrCode(boxLabelIdentifier: "xxx") { id } }"""
    )

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "qr")
        .dicts()
    )
    today = date.today().isoformat()
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": "New QR-code generated",
            "record_id": int(qr_code_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "New QR-code generated",
            "record_id": int(created_qr_code["id"]),
            "from_int": None,
            "to_int": None,
        },
    ]
