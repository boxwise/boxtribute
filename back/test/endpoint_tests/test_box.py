import pytest
from boxtribute_server.enums import BoxState
from boxtribute_server.models.crud import BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS
from boxtribute_server.models.definitions.history import DbChangeHistory
from utils import (
    assert_bad_user_input,
    assert_internal_server_error,
    assert_successful_request,
)


def test_box_query_by_label_identifier(read_only_client, default_box, tags):
    # Test case 8.1.1
    label_identifier = default_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    id
                    labelIdentifier
                    location {{ id }}
                    numberOfItems
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
        "location": {"id": str(default_box["location"])},
        "numberOfItems": default_box["number_of_items"],
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
    # Test case 8.1.5
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
    client,
    qr_code_without_box,
    default_size,
    another_size,
    products,
    default_location,
    null_box_state_location,
    tags,
):
    # Test case 8.2.1
    size_id = str(default_size["id"])
    location_id = str(default_location["id"])
    product_id = str(products[0]["id"])
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{
                id
                labelIdentifier
                numberOfItems
                location {{ id }}
                product {{ id }}
                size {{ id }}
                qrCode {{ id }}
                state
                createdOn
                createdBy {{ id }}
                lastModifiedOn
                lastModifiedBy {{ id }}
                comment
                tags {{ id }}
            }}
        }}"""
    created_box = assert_successful_request(client, mutation)
    assert created_box["numberOfItems"] is None
    assert created_box["state"] == BoxState.InStock.name
    assert created_box["location"]["id"] == location_id
    assert created_box["product"]["id"] == product_id
    assert created_box["size"]["id"] == size_id
    assert created_box["qrCode"] is None
    assert created_box["createdOn"] == created_box["lastModifiedOn"]
    assert created_box["createdBy"] == created_box["lastModifiedBy"]
    assert created_box["comment"] == ""
    assert created_box["tags"] == []

    # Test case 8.2.2
    number_of_items = 3
    comment = "good box"
    tag_id = str(tags[1]["id"])
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    numberOfItems: {number_of_items}
                    comment: "{comment}"
                    qrCode: "{qr_code_without_box["code"]}"
                    tagIds: [{tag_id}]
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{
                numberOfItems
                location {{ id }}
                product {{ id }}
                size {{ id }}
                qrCode {{ id }}
                state
                tags {{ id }}
            }}
        }}"""
    another_created_box = assert_successful_request(client, mutation)
    assert another_created_box == {
        "numberOfItems": number_of_items,
        "location": {"id": location_id},
        "product": {"id": product_id},
        "size": {"id": size_id},
        "qrCode": {"id": str(qr_code_without_box["id"])},
        "state": BoxState.InStock.name,
        "tags": [{"id": tag_id}],
    }

    # Test case 8.2.11
    new_size_id = str(another_size["id"])
    new_product_id = str(products[2]["id"])
    new_location_id = str(null_box_state_location["id"])
    state = BoxState.Lost.name
    comment = "updatedComment"
    nr_items = 7777
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    numberOfItems: {nr_items},
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                    comment: "{comment}"
                    locationId: {new_location_id},
                    sizeId: {new_size_id},
                    productId: {new_product_id},
                    state: {state}
                }} ) {{
                id
                numberOfItems
                lastModifiedOn
                createdOn
                qrCode {{ id }}
                comment
                location {{ id }}
                size {{ id }}
                product {{ id }}
                state
                history {{
                    changes
                    user {{ name }}
                }}
            }}
        }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["comment"] == comment
    assert updated_box["numberOfItems"] == nr_items
    assert updated_box["qrCode"] == created_box["qrCode"]
    assert updated_box["location"]["id"] == new_location_id
    assert updated_box["size"]["id"] == new_size_id
    assert updated_box["product"]["id"] == new_product_id
    assert updated_box["state"] == state
    assert updated_box["history"] == [
        {
            "changes": "created record",
            "user": {"name": "coord"},
        },
        {
            "changes": f"changed product type from {products[0]['name']} to "
            + f"{products[2]['name']};",
            "user": {"name": "coord"},
        },
        {
            "changes": f"changed size from {default_size['label']} to "
            + f"{another_size['label']};",
            "user": {"name": "coord"},
        },
        {
            "changes": f"changed the number of items from None to {nr_items};",
            "user": {"name": "coord"},
        },
        {
            "changes": f"changed box location from {default_location['name']} to "
            + f"{null_box_state_location['name']};",
            "user": {"name": "coord"},
        },
        {
            "changes": 'changed comments from "" to "updatedComment";',
            "user": {"name": "coord"},
        },
        {
            "changes": f"changed box state from InStock to {state};",
            "user": {"name": "coord"},
        },
    ]

    # Test cases 8.2.1, 8.2.2., 8.2.11
    history = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
            DbChangeHistory.record_id,
            DbChangeHistory.table_name,
            DbChangeHistory.user,
            DbChangeHistory.ip,
        )
        .order_by(DbChangeHistory.change_date)
        .dicts()
    )
    box_id = int(updated_box["id"])
    assert history[1:] == [
        {
            "changes": "Record created",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "Record created",
            "from_int": None,
            "to_int": None,
            "record_id": box_id + 1,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "product_id",
            "from_int": int(product_id),
            "to_int": int(new_product_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "size_id",
            "from_int": int(size_id),
            "to_int": int(new_size_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "items",
            "from_int": None,
            "to_int": nr_items,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "location_id",
            "from_int": int(location_id),
            "to_int": int(new_location_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": f"""comments changed from "" to "{comment}";""",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "box_state_id",
            "from_int": BoxState.InStock.value,
            "to_int": BoxState[state].value,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
    ]


def test_update_box_tag_ids(client, default_box, tags):
    # Test case 8.2.11c
    label_identifier = default_box["label_identifier"]
    tag_id = str(tags[1]["id"])
    another_tag_id = str(tags[2]["id"])

    # Default box has tag ID 2 assigned already. Remove it and add tag ID 3
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [{another_tag_id}] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": [{"id": another_tag_id}]}

    # Now add tag ID 2 back while keeping tag ID 3
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [{tag_id},{another_tag_id}] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": [{"id": tag_id}, {"id": another_tag_id}]}

    # Remove all assigned tags when passing empty list
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": []}


def _format(parameter):
    try:
        return ",".join(f"{k}={v}" for f in parameter for k, v in f.items())
    except TypeError:
        return parameter  # integer number


@pytest.mark.parametrize(
    "filters,number",
    [
        # Test case 8.1.7
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


def test_update_box_state(
    client,
    default_product,
    null_box_state_location,
    non_default_box_state_location,
    default_size,
):
    # Test case 8.2.2a
    # creating a box in a location with box_state=NULL set the box's location to InStock
    creation_input = f"""creationInput: {{
        productId: {default_product["id"]}
        locationId: {null_box_state_location["id"]}
        sizeId: {default_size["id"]}
    }}"""
    mutation = f"mutation {{ createBox({creation_input}) {{ state labelIdentifier }} }}"
    box = assert_successful_request(client, mutation)
    assert box["state"] == BoxState.InStock.name

    # Test case 8.2.11a
    # updating to a location with box_state!=NULL should set the state on the box too
    update_input = f"""updateInput: {{
        labelIdentifier: "{box["labelIdentifier"]}"
        locationId: {non_default_box_state_location["id"]}
    }}"""
    mutation = f"mutation {{ updateBox({update_input}) {{ state labelIdentifier }} }}"
    box = assert_successful_request(client, mutation)
    assert box["state"] == non_default_box_state_location["box_state"].name

    # Test case 8.2.11b
    # setting it back to a location with a box_state=NULL should NOT change the box's
    # state
    update_input = f"""updateInput: {{
        labelIdentifier: "{box["labelIdentifier"]}"
        locationId: {null_box_state_location["id"]}
    }}"""
    mutation = f"mutation {{ updateBox({update_input}) {{ state }} }}"
    box = assert_successful_request(client, mutation)
    assert box["state"] == non_default_box_state_location["box_state"].name

    # Test case 8.2.2b
    # creating a box with an explicit box_state in a location with box_state=NULL should
    # set the box_state to that explicit box_state
    creation_input = f"""creationInput: {{
        productId: {default_product["id"]}
        locationId: {non_default_box_state_location["id"]}
        sizeId: {default_size["id"]}
    }}"""
    mutation = f"mutation {{ createBox({creation_input}) {{ state }} }}"
    box = assert_successful_request(client, mutation)
    assert box["state"] == non_default_box_state_location["box_state"].name


def test_box_label_identifier_generation(
    mocker, client, default_box, default_location, default_product, default_size
):
    creation_input = f"""creationInput: {{
        productId: {default_product["id"]}
        locationId: {default_location["id"]}
        sizeId: {default_size["id"]}
    }}"""
    mutation = f"mutation {{ createBox({creation_input}) {{ labelIdentifier }} }}"

    rng_function = mocker.patch("random.choices")
    # Test case 8.2.2c
    # Verify that box-creation fails after several attempts if newly generated
    # identifier is never unique
    rng_function.return_value = default_box["label_identifier"]
    assert_internal_server_error(client, mutation)
    assert rng_function.call_count == BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS

    # Verify that box-creation succeeds even if an existing identifier happens to be
    # generated once
    new_identifier = "11112222"
    side_effect = [default_box["label_identifier"], new_identifier]
    rng_function.reset_mock(return_value=True)
    rng_function.side_effect = side_effect
    new_box = assert_successful_request(client, mutation)
    assert rng_function.call_count == len(side_effect)
    assert new_box["labelIdentifier"] == new_identifier


@pytest.mark.parametrize(
    "product_id,size_id,location_id,qr_code",
    # Test cases 8.2.3, 8.2.4, 8.2.5,, 8.2.6, 8.2.12, 8.2.13, 8.2.14
    [[0, 1, 1, "555"], [1, 0, 1, "555"], [1, 1, 0, "555"], [1, 1, 1, "000"]],
)
def test_mutate_box_with_non_existing_resource(
    read_only_client, default_box, product_id, size_id, location_id, qr_code
):
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    qrCode: "{qr_code}"
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Box QR code cannot be updated, hence no errors possible
    if qr_code == "000":
        return

    label_identifier = default_box["label_identifier"]
    update_input = f"""{{
                labelIdentifier: "{label_identifier}"
                productId: {product_id},
                locationId: {location_id},
                sizeId: {size_id},
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)


def test_mutate_box_with_negative_number_of_items(
    read_only_client, default_box, default_product, default_location, default_size
):
    # Test case 8.2.10
    size_id = str(default_size["id"])
    location_id = str(default_location["id"])
    product_id = str(default_product["id"])
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    numberOfItems: -3
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19
    label_identifier = default_box["label_identifier"]
    update_input = f"""{{
                labelIdentifier: "{label_identifier}"
                numberOfItems: -5
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)
