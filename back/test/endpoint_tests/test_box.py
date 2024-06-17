import time
from datetime import date

import pytest
from auth import mock_user_for_request
from boxtribute_server.business_logic.warehouse.box.crud import (
    BOX_LABEL_IDENTIFIER_GENERATION_ATTEMPTS,
)
from boxtribute_server.enums import BoxState, TagType
from boxtribute_server.models.definitions.history import DbChangeHistory
from utils import (
    assert_bad_user_input,
    assert_forbidden_request,
    assert_internal_server_error,
    assert_successful_request,
)

today = date.today().isoformat()


def test_box_query_by_label_identifier(
    read_only_client, default_box, tags, in_transit_box, default_shipment_detail
):
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
                    deletedOn
                    comment
                    tags {{
                        id
                        name
                        color
                    }}
                    shipmentDetail {{ id }}
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
        "deletedOn": None,
        "comment": None,
        "tags": [
            {
                "id": str(tags[1]["id"]),
                "name": tags[1]["name"],
                "color": tags[1]["color"],
            },
            {
                "id": str(tags[2]["id"]),
                "name": tags[2]["name"],
                "color": tags[2]["color"],
            },
        ],
        "shipmentDetail": None,
    }

    label_identifier = in_transit_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    shipmentDetail {{ id }}
                }} }}"""
    queried_box = assert_successful_request(read_only_client, query)
    assert queried_box == {"shipmentDetail": {"id": str(default_shipment_detail["id"])}}


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


def test_boxes_query(read_only_client, default_location_boxes):
    base_id = 1
    query = f"""query {{ boxes(baseId: {base_id}) {{ totalCount }} }}"""
    boxes = assert_successful_request(read_only_client, query)
    assert boxes == {"totalCount": len(default_location_boxes)}

    query = f"""query {{ boxes(baseId: {base_id}, filterInput: {{productGender: Men}})
                        {{ totalCount }} }}"""
    boxes = assert_successful_request(read_only_client, query)
    assert boxes == {"totalCount": 0}

    query = f"""query {{ boxes(baseId: {base_id}, filterInput: {{tagIds: [2]}})
                        {{ totalCount }} }}"""
    boxes = assert_successful_request(read_only_client, query)
    assert boxes == {"totalCount": 1}

    query = f"""query {{ boxes(baseId: {base_id}, filterInput: {{tagIds: [2, 3]}})
                        {{ totalCount }} }}"""
    boxes = assert_successful_request(read_only_client, query)
    assert boxes == {"totalCount": 2}


def test_box_mutations(
    client,
    another_box,
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
    original_number_of_items = 10
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    numberOfItems: {original_number_of_items},
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
    assert created_box["numberOfItems"] == original_number_of_items
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
                labelIdentifier
                location {{ id }}
                product {{ id }}
                size {{ id }}
                qrCode {{ id }}
                state
                tags {{ id }}
            }}
        }}"""
    another_created_box = assert_successful_request(client, mutation)
    another_created_box_label_identifier = another_created_box.pop("labelIdentifier")
    assert another_created_box == {
        "numberOfItems": number_of_items,
        "location": {"id": location_id},
        "product": {"id": product_id},
        "size": {"id": size_id},
        "qrCode": {"id": str(qr_code_without_box["id"])},
        "state": BoxState.InStock.name,
        "tags": [{"id": tag_id}],
    }

    # Wait for one second here such that the second-precision change_date of the
    # previous creation entry is different from the following change entries. We then
    # can verify that the sorting of history entries by most recent first works.
    time.sleep(1)
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
                    id
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
        # The entries for the update have the same change_date, hence the IDs do not
        # appear reversed
        {
            "id": "119",
            "changes": f"changed box state from InStock to {state}",
            "user": {"name": "coord"},
        },
        {
            "id": "118",
            "changes": 'changed comments from "" to "updatedComment";',
            "user": {"name": "coord"},
        },
        {
            "id": "117",
            "changes": f"changed box location from {default_location['name']} to "
            + f"{null_box_state_location['name']}",
            "user": {"name": "coord"},
        },
        {
            "id": "116",
            "changes": f"changed the number of items from {original_number_of_items} "
            + f"to {nr_items}",
            "user": {"name": "coord"},
        },
        {
            "id": "115",
            "changes": f"changed size from {default_size['label']} to "
            + f"{another_size['label']}",
            "user": {"name": "coord"},
        },
        {
            "id": "114",
            "changes": f"changed product type from {products[0]['name']} to "
            + f"{products[2]['name']}",
            "user": {"name": "coord"},
        },
        {
            "id": "112",
            "changes": "created record",
            "user": {"name": "coord"},
        },
    ]

    label_identifiers = ",".join(
        f'"{i}"'
        for i in [created_box["labelIdentifier"], another_created_box_label_identifier]
    )
    # Test case 8.2.22a, 8.2.22c
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}], locationId: {location_id} }} ) {{
                ...on BoxPage {{ elements {{
                    location {{ id }}
                    lastModifiedOn
                    history {{ changes }}
                }} }} }} }}"""
    moved_boxes = assert_successful_request(client, mutation)["elements"]
    assert moved_boxes[0]["location"]["id"] == location_id
    assert moved_boxes[0]["lastModifiedOn"].startswith(today)
    assert moved_boxes[0]["history"][0]["changes"] == (
        f"changed box state from {BoxState.Lost.name} to {BoxState.InStock.name}"
    )
    assert moved_boxes[0]["history"][1]["changes"] == (
        f"changed box location from {null_box_state_location['name']} to "
        f"{default_location['name']}"
    )
    # another_created_box is ignored because it's already in the requested location
    assert len(moved_boxes) == 1

    # Test case 8.2.23a, 8.2.23c
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    tagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert tagged_boxes == [{"tags": [{"id": tag_id}]}]

    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    tagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert tagged_boxes == []

    generic_tag_id = str(tags[2]["id"])
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {generic_tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    tagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert tagged_boxes == [
        {"tags": [{"id": tag_id}, {"id": generic_tag_id}]} for _ in range(2)
    ]

    # Test case 8.2.24a
    label_identifier = f'"{created_box["labelIdentifier"]}"'
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifier}], tagId: {generic_tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    untagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert untagged_boxes == [{"tags": [{"id": tag_id}]}]

    # Verify that tag is not removed from the other box
    query = f"""query {{ box(labelIdentifier: "{another_created_box_label_identifier}")
                    {{ tags {{ id }} }} }}"""
    response = assert_successful_request(client, query)
    assert response == {"tags": [{"id": tag_id}, {"id": generic_tag_id}]}

    # Test case 8.2.24c
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {generic_tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    untagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert untagged_boxes == [{"tags": [{"id": tag_id}]}]

    # Test case 8.2.23h
    beneficiary_tag_id = str(tags[0]["id"])
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {beneficiary_tag_id} }} ) {{
                ...on TagTypeMismatchError {{ expectedType }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": TagType.Box.name}

    # Test case 8.2.24h
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {beneficiary_tag_id} }} ) {{
                ...on TagTypeMismatchError {{ expectedType }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": TagType.Box.name}

    # Test case 8.2.25
    mutation = f"""mutation {{ deleteBoxes( labelIdentifiers: [{label_identifiers}] ) {{
            ...on BoxPage {{ elements {{
                deletedOn
                history {{ changes }}
            }} }} }} }}"""
    deleted_boxes = assert_successful_request(client, mutation)["elements"]
    for box in deleted_boxes:
        assert box["deletedOn"].startswith(today)
        assert box["history"][0]["changes"] == "deleted record"

    # Test case 8.2.22b, 8.2.22d
    label_identifiers = ",".join(
        f'"{i}"'
        for i in [
            another_box["label_identifier"],  # in base that user isn't authorized for
            99119911,  # non-existing box
        ]
    )
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}], locationId: {location_id} }} ) {{
                ...on BoxPage {{ elements {{
                    location {{ id }}
                    lastModifiedOn
                    history {{ changes }}
                }} }} }} }}"""
    moved_boxes = assert_successful_request(client, mutation)["elements"]
    assert moved_boxes == []

    # Test case 8.2.23b, 8.2.23d
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    tagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert tagged_boxes == []

    # Test case 8.2.24b, 8.2.24d
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxPage {{ elements {{
                    tags {{ id }}
                }} }} }} }}"""
    tagged_boxes = assert_successful_request(client, mutation)["elements"]
    assert tagged_boxes == []

    # Test cases 8.2.26, 8.2.27, 8.2.28
    label_identifiers = ",".join(
        f'"{i}"'
        for i in [
            another_box["label_identifier"],  # in base that user isn't authorized for
            created_box["labelIdentifier"],  # already deleted box
            99119911,  # non-existing box
        ]
    )
    mutation = f"""mutation {{ deleteBoxes( labelIdentifiers: [{label_identifiers}] ) {{
            ...on BoxPage {{ elements {{
                deletedOn
                history {{ changes }}
            }} }} }} }}"""
    deleted_boxes = assert_successful_request(client, mutation)["elements"]
    assert deleted_boxes == []

    # Test cases 8.2.1, 8.2.2., 8.2.11, 8.2.25
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
    assert history[21:] == [
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
            "from_int": original_number_of_items,
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
        {
            "changes": "location_id",
            "from_int": int(new_location_id),
            "to_int": int(location_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "box_state_id",
            "from_int": BoxState.Lost.value,
            "to_int": BoxState.InStock.value,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "Record deleted",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
        },
        {
            "changes": "Record deleted",
            "from_int": None,
            "to_int": None,
            "record_id": box_id + 1,
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

    # Add tag ID 2
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{tag_id}] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": [{"id": tag_id}]}

    # Add the same tag again without an error being thrown
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{tag_id}] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": [{"id": tag_id}]}

    # Add tag ID 3. Both tags are assigned to the box
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{another_tag_id}] }} ) {{ tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box == {"tags": [{"id": tag_id}, {"id": another_tag_id}]}


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
        [[{"states": "[InTransit]"}], 2],
        [[{"states": "[Receiving]"}], 0],
        [[{"states": "[NotDelivered]"}], 2],
        [[{"states": "[InStock,Lost]"}], 2],
        [[{"states": "[Lost,MarkedForShipment]"}], 4],
        [[{"lastModifiedFrom": '"2020-01-01"'}], 13],
        [[{"lastModifiedFrom": '"2021-02-02"'}], 2],
        [[{"lastModifiedFrom": '"2022-01-01"'}], 0],
        [[{"lastModifiedUntil": '"2022-01-01"'}], 13],
        [[{"lastModifiedUntil": '"2020-11-27"'}], 11],
        [[{"lastModifiedUntil": '"2020-01-01"'}], 0],
        [[{"productGender": "Women"}], 12],
        [[{"productGender": "Men"}], 0],
        [[{"productId": "1"}], 11],
        [[{"productId": "2"}], 0],
        [[{"sizeId": "1"}], 12],
        [[{"sizeId": "2"}], 1],
        [[{"productCategoryId": "1"}], 12],
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


def test_create_box_with_used_qr_code(
    read_only_client, default_qr_code, default_size, default_location, default_product
):
    size_id = str(default_size["id"])
    location_id = str(default_location["id"])
    product_id = str(default_product["id"])
    creation_input = f"""{{
                    productId: {product_id}
                    locationId: {location_id}
                    sizeId: {size_id}
                    numberOfItems: 1
                    qrCode: "{default_qr_code['code']}"
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)


def test_access_in_transit_or_not_delivered_box(
    read_only_client,
    mocker,
    in_transit_box,
    not_delivered_box,
    qr_code_for_not_delivered_box,
    qr_code_for_in_transit_box,
):
    def _create_query(label_identifier):
        return f"""query {{ box(labelIdentifier: "{label_identifier}") {{ id }} }}"""

    def _create_qr_query(qr_code):
        return f"""query {{ qrCode(qrCode: "{qr_code['code']}") {{ box {{ id }} }} }}"""

    queries = {
        str(in_transit_box["id"]): _create_query(in_transit_box["label_identifier"]),
        str(not_delivered_box["id"]): _create_query(
            not_delivered_box["label_identifier"]
        ),
    }
    qr_queries = {
        str(in_transit_box["id"]): _create_qr_query(qr_code_for_in_transit_box),
        str(not_delivered_box["id"]): _create_qr_query(qr_code_for_not_delivered_box),
    }

    # Default user is in the shipment source base (ID 1) and able to view the box
    for box_id, query in queries.items():
        box = assert_successful_request(read_only_client, query)
        assert box == {"id": box_id}
    for box_id, query in qr_queries.items():
        qr_code = assert_successful_request(read_only_client, query)
        assert qr_code == {"box": {"id": box_id}}

    # user is in the shipment target base (ID 3) and able to view the box
    mock_user_for_request(mocker, base_ids=[3], organisation_id=2, user_id=2)
    for box_id, query in queries.items():
        box = assert_successful_request(read_only_client, query)
        assert box == {"id": box_id}
    for box_id, query in qr_queries.items():
        qr_code = assert_successful_request(read_only_client, query)
        assert qr_code == {"box": {"id": box_id}}

    # user is in unrelated base (ID 2) and NOT permitted to view the box
    mock_user_for_request(mocker, base_ids=[2], organisation_id=2, user_id=3)
    for box_id, query in queries.items():
        assert_forbidden_request(read_only_client, query)
    for box_id, query in qr_queries.items():
        assert_forbidden_request(read_only_client, query, value={"box": None})


def test_box_with_large_history(
    client, default_product, default_size, default_location
):
    creation_input = f"""{{
                    productId: {default_product["id"]},
                    locationId: {default_location["id"]},
                    sizeId: {default_size["id"]},
                    numberOfItems: 2,
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ labelIdentifier }} }}"""
    box = assert_successful_request(client, mutation)
    for i in range(1, 60):
        mutation = f"""mutation {{
                updateBox(
                    updateInput : {{
                        numberOfItems: {i},
                        labelIdentifier: "{box["labelIdentifier"]}"
                    }} )
                {{ history {{ changeDate changes }} }} }}"""
        assert_successful_request(client, mutation)
