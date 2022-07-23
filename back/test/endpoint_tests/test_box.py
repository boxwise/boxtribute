import pytest
from boxtribute_server.enums import BoxState
from utils import assert_successful_request


def test_box_query_by_label_identifier(read_only_client, default_box, tags):
    label_identifier = default_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    id
                    labelIdentifier
                    place {{ id }}
                    items
                    product {{ id }}
                    size {{ id }}
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
        "place": {"id": str(default_box["location"])},
        "items": default_box["items"],
        "product": {"id": str(default_box["product"])},
        "size": {"id": str(default_box["size"])},
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_box["qr_code"])},
        "createdBy": {"id": str(default_box["created_by"])},
        "comment": None,
        "tags": [
            {
                "id": str(tags[1]["id"]),
                "name": tags[1]["name"],
                "color": tags[1]["color"],
            }
        ],
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


def test_box_mutations(
    client, qr_code_without_box, default_size, another_size, products, default_location
):
    size_id = str(default_size["id"])
    location_id = str(default_location["id"])
    product_id = str(products[0]["id"])
    box_creation_input_string = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    qrCode: "{qr_code_without_box["code"]}",
                }}"""
    mutation = f"""mutation {{
            createBox(
                creationInput : {box_creation_input_string}
            ) {{
                id
                labelIdentifier
                items
                place {{ id }}
                product {{ id }}
                size {{ id }}
                qrCode {{ id }}
                state
                createdOn
                createdBy {{ id }}
                lastModifiedOn
                lastModifiedBy {{ id }}
            }}
        }}"""
    created_box = assert_successful_request(client, mutation)
    assert created_box["items"] is None
    assert created_box["state"] == BoxState.InStock.name
    assert created_box["location"]["id"] == location_id
    assert created_box["product"]["id"] == product_id
    assert created_box["size"]["id"] == size_id
    assert created_box["qrCode"]["id"] == str(qr_code_without_box["id"])
    assert created_box["createdOn"] == created_box["lastModifiedOn"]
    assert created_box["createdBy"] == created_box["lastModifiedBy"]

    size_id = str(another_size["id"])
    product_id = str(products[2]["id"])
    comment = "updatedComment"
    nr_items = 7777
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    items: {nr_items},
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                    comment: "{comment}"
                    sizeId: {size_id},
                    productId: {product_id},
                }} ) {{
                items
                lastModifiedOn
                createdOn
                qrCode {{ id }}
                comment
                size {{ id }}
                product {{ id }}
            }}
        }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["comment"] == comment
    assert updated_box["items"] == nr_items
    assert updated_box["qrCode"] == created_box["qrCode"]
    assert updated_box["size"]["id"] == size_id
    assert updated_box["product"]["id"] == product_id


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
