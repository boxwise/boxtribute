import pytest
from boxtribute_server.enums import BoxState
from utils import assert_successful_request


def test_box_query_by_label_identifier(
    read_only_client,
    default_box,
    tags
):
    label_identifier = default_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    id
                    labelIdentifier
                    location {{ id }}
                    items
                    product {{ id }}
                    size
                    state
                    qrCode {{ id }}
                    createdBy {{ id }}
                    comment
                    tags {{
                        id
                        name
                        color
                    }}
                }}
            }}"""
    queried_box = assert_successful_request(read_only_client, query)
    assert queried_box == {
        "id": str(default_box["id"]),
        "labelIdentifier": label_identifier,
        "location": {"id": str(default_box["location"])},
        "items": default_box["items"],
        "product": {"id": str(default_box["product"])},
        "size": str(default_box["size"]),
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_box["qr_code"])},
        "createdBy": {"id": str(default_box["created_by"])},
        "comment": default_box["comment"],
        "tags": [
            {
                "id": str(tags[1]['id']), 
                "name": tags[1]['name'], 
                "color": tags[1]['color']
            }
        ]
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


def test_box_mutations(client, qr_code_without_box, default_size, another_size):
    box_creation_input_string = f"""{{
                    productId: 1,
                    items: 9999,
                    locationId: 1,
                    comment: "",
                    sizeId: {default_size["id"]},
                    qrCode: "{qr_code_without_box["code"]}",
                }}"""
    mutation = f"""mutation {{
            createBox(
                creationInput : {box_creation_input_string}
            ) {{
                id
                labelIdentifier
                items
                location {{ id }}
                product {{ id }}
                size
                qrCode {{ id }}
                state
                createdOn
                createdBy {{ id }}
                lastModifiedOn
                lastModifiedBy {{ id }}
            }}
        }}"""
    created_box = assert_successful_request(client, mutation)
    assert created_box["items"] == 9999
    assert created_box["state"] == "InStock"
    assert created_box["location"]["id"] == "1"
    assert created_box["product"]["id"] == "1"
    assert created_box["size"] == str(default_size["id"])
    assert created_box["qrCode"]["id"] == str(qr_code_without_box["id"])
    assert created_box["createdOn"] == created_box["lastModifiedOn"]
    assert created_box["createdBy"] == created_box["lastModifiedBy"]

    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    items: 7777,
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                    comment: "updatedComment"
                    sizeId: {another_size["id"]},
                }} ) {{
                items
                lastModifiedOn
                createdOn
                qrCode {{ id }}
                comment
                size
            }}
        }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["comment"] == "updatedComment"
    assert updated_box["items"] == 7777
    assert updated_box["qrCode"] == created_box["qrCode"]
    assert updated_box["size"] == str(another_size["id"])


def _format(parameter):
    try:
        return ",".join(f"{k}={v}" for f in parameter for k, v in f.items())
    except TypeError:
        return parameter  # integer number


@pytest.mark.parametrize(
    "filters,number",
    [
        [[{"states": "[InStock]"}], 1],
        [[{"states": "[Lost]"}], 1],
        [[{"states": "[MarkedForShipment]"}], 3],
        [[{"states": "[Received]"}], 0],
        [[{"states": "[InStock,Lost]"}], 2],
        [[{"states": "[Lost,MarkedForShipment]"}], 4],
        [[{"lastModifiedFrom": '"2020-01-01"'}], 5],
        [[{"lastModifiedFrom": '"2021-02-02"'}], 2],
        [[{"lastModifiedFrom": '"2022-01-01"'}], 0],
        [[{"lastModifiedUntil": '"2022-01-01"'}], 5],
        [[{"lastModifiedUntil": '"2020-11-27"'}], 3],
        [[{"lastModifiedUntil": '"2020-01-01"'}], 0],
        [[{"productGender": "Women"}], 5],
        [[{"productGender": "Men"}], 0],
        [[{"productCategoryId": "1"}], 5],
        [[{"productCategoryId": "2"}], 0],
        [[{"states": "[MarkedForShipment]"}, {"lastModifiedFrom": '"2021-02-01"'}], 2],
        [[{"states": "[InStock,Lost]"}, {"productGender": "Boy"}], 0],
    ],
    ids=_format,
)
def test_boxes_query_filter(read_only_client, default_location, filters, number):
    filter_input = ", ".join(f"{k}: {v}" for f in filters for k, v in f.items())
    query = f"""query {{ location(id: {default_location['id']}) {{
                boxes(filterInput: {{ {filter_input} }}) {{
                    elements {{ id state }}
                }} }} }}"""
    location = assert_successful_request(read_only_client, query)
    boxes = location["boxes"]["elements"]
    assert len(boxes) == number

    for f in filters:
        if "states" in f and number > 0:
            states = f["states"].strip("[]").split(",")
            assert {b["state"] for b in boxes} == set(states)
