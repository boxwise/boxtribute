from boxtribute_server.enums import BoxState
from utils import assert_successful_request


def test_box_query_by_label_identifier(
    read_only_client,
    default_box,
):
    label_identifier = default_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    id
                    labelIdentifier
                    location {{
                        id
                    }}
                    items
                    product {{
                        id
                    }}
                    size
                    state
                    qrCode {{
                        id
                    }}
                    createdBy {{
                        id
                    }}
                    comment
                }}
            }}"""
    queried_box = assert_successful_request(read_only_client, query)
    assert queried_box == {
        "id": str(default_box["id"]),
        "labelIdentifier": label_identifier,
        "location": {"id": str(default_box["location"])},
        "items": default_box["items"],
        "product": {"id": str(default_box["product"])},
        "size": None,
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_box["qr_code"])},
        "createdBy": {"id": str(default_box["created_by"])},
        "comment": default_box["comment"],
    }


def test_box_query_by_qr_code(read_only_client, default_box, default_qr_code):
    query = f"""query {{
                qrCode(qrCode: "{default_qr_code['code']}") {{
                    box {{
                        labelIdentifier
                    }}
                }}
            }}"""
    queried_box = assert_successful_request(read_only_client, query)["box"]
    assert queried_box["labelIdentifier"] == default_box["label_identifier"]


def test_box_mutations(client, qr_code_without_box):
    box_creation_input_string = f"""{{
                    productId: 1,
                    items: 9999,
                    locationId: 1,
                    comment: "",
                    sizeId: 1,
                    qrCode: "{qr_code_without_box["code"]}",
                }}"""
    mutation = f"""mutation {{
            createBox(
                boxCreationInput : {box_creation_input_string}
            ) {{
                id
                labelIdentifier
                items
                location {{
                    id
                }}
                product {{
                    id
                }}
                qrCode {{
                    id
                }}
                state
                createdOn
                createdBy {{
                    id
                }}
                lastModifiedOn
                lastModifiedBy {{
                    id
                }}
            }}
        }}"""
    created_box = assert_successful_request(client, mutation)
    assert created_box["items"] == 9999
    assert created_box["state"] == "InStock"
    assert created_box["location"]["id"] == "1"
    assert created_box["product"]["id"] == "1"
    assert created_box["qrCode"]["id"] == str(qr_code_without_box["id"])
    assert created_box["createdOn"] == created_box["lastModifiedOn"]
    assert created_box["createdBy"] == created_box["lastModifiedBy"]

    mutation = f"""mutation {{
            updateBox(
                boxUpdateInput : {{
                    items: 7777,
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                }} ) {{
                items
                lastModifiedOn
                createdOn
                qrCode {{
                    id
                }}
            }}
        }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["items"] == 7777
    assert updated_box["qrCode"] == created_box["qrCode"]
