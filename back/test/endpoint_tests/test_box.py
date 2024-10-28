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
    read_only_client,
    default_box,
    tags,
    in_transit_box,
    default_shipment_detail,
    measure_product_box,
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
                    displayUnit {{ id }}
                    measureValue
                    state
                    qrCode {{ id }}
                    createdBy {{ id }}
                    lastModifiedBy {{ id }}
                    deletedOn
                    comment
                    tags {{
                        id
                        name
                        color
                    }}
                    shipmentDetail {{ id }}
                    history {{ id changes }}
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
        "displayUnit": None,
        "measureValue": None,
        "state": BoxState.InStock.name,
        "qrCode": {"id": str(default_box["qr_code"])},
        "createdBy": {"id": str(default_box["created_by"])},
        "lastModifiedBy": {"id": str(default_box["last_modified_by"])},
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
        "history": [
            {"id": "ta4", "changes": "assigned tag 'pallet1' to box"},
            {"id": "tr3", "changes": "removed tag 'pallet1' from box"},
            {"id": "ta3", "changes": "assigned tag 'pallet1' to box"},
            {"id": "2", "changes": "created record"},
        ],
    }

    label_identifier = in_transit_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    shipmentDetail {{ id }}
                }} }}"""
    queried_box = assert_successful_request(read_only_client, query)
    assert queried_box == {"shipmentDetail": {"id": str(default_shipment_detail["id"])}}

    label_identifier = measure_product_box["label_identifier"]
    query = f"""query {{
                box(labelIdentifier: "{label_identifier}") {{
                    product {{ id }}
                    size {{ id }}
                    displayUnit {{ id }}
                    measureValue
                }} }}"""
    box = assert_successful_request(read_only_client, query)
    assert box == {
        "product": {"id": str(measure_product_box["product"])},
        "size": None,
        "displayUnit": {"id": str(measure_product_box["display_unit"])},
        "measureValue": 1000 * measure_product_box["measure_value"],
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
    assert boxes == {"totalCount": 3}


def test_box_mutations(
    client,
    another_box,
    qr_code_without_box,
    default_size,
    another_size,
    products,
    default_location,
    yet_another_location,
    null_box_state_location,
    deleted_location,
    tags,
    gram_unit,
    pound_unit,
    mocker,
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
                history {{ changes }}
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
        "history": [{"changes": "created record"}],
    }

    # Test case 8.2.2d
    unit_id = str(gram_unit["id"])
    measure_product_id = str(products[7]["id"])
    measure_value = 1500.0
    creation_input = f"""{{
                    productId: {measure_product_id}
                    locationId: {location_id}
                    displayUnitId: {unit_id}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{
                id
                labelIdentifier
                location {{ id }}
                product {{ id }}
                size {{ id }}
                displayUnit {{ id }}
                measureValue
            }}
        }}"""
    third_created_box = assert_successful_request(client, mutation)
    third_created_box_id = int(third_created_box.pop("id"))
    third_created_box_label_identifier = third_created_box.pop("labelIdentifier")
    assert third_created_box == {
        "location": {"id": location_id},
        "product": {"id": measure_product_id},
        "size": None,
        "displayUnit": {"id": unit_id},
        "measureValue": measure_value,
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

    # Test case 8.2.11d
    # Switch size-product -> measure-product
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    labelIdentifier: "{created_box["labelIdentifier"]}"
                    productId: {measure_product_id}
                    measureValue: 250
                    displayUnitId: {unit_id}
                }} ) {{
                id
                history {{
                    id
                    changes
                    user {{ name }}
                }}
                size {{ id }}
                product {{ id }}
                displayUnit {{ id }}
                measureValue
            }}
        }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["size"] is None
    assert updated_box["product"]["id"] == measure_product_id
    assert updated_box["displayUnit"]["id"] == unit_id
    assert updated_box["measureValue"] == 250
    assert updated_box["history"] == [
        # The entries for the update have the same change_date, hence the IDs do not
        # appear reversed
        {
            "id": "124",
            "changes": 'changed units of measure from "" to 250.00g',
            "user": {"name": "coord"},
        },
        {
            "id": "123",
            "changes": f"changed product type from {products[2]['name']} to "
            + f"{products[7]['name']}",
            "user": {"name": "coord"},
        },
        {
            "id": "122",
            "changes": f"changed box state from InStock to {state}",
            "user": {"name": "coord"},
        },
        {
            "id": "121",
            "changes": 'changed comments from "" to "updatedComment";',
            "user": {"name": "coord"},
        },
        {
            "id": "120",
            "changes": f"changed box location from {default_location['name']} to "
            + f"{null_box_state_location['name']}",
            "user": {"name": "coord"},
        },
        {
            "id": "119",
            "changes": f"changed the number of items from {original_number_of_items} "
            + f"to {nr_items}",
            "user": {"name": "coord"},
        },
        {
            "id": "118",
            "changes": f"changed size from {default_size['label']} to "
            + f"{another_size['label']}",
            "user": {"name": "coord"},
        },
        {
            "id": "117",
            "changes": f"changed product type from {products[0]['name']} to "
            + f"{products[2]['name']}",
            "user": {"name": "coord"},
        },
        {
            "id": "116",
            "changes": "created record",
            "user": {"name": "coord"},
        },
    ]

    new_unit_id = str(pound_unit["id"])
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    displayUnitId: {new_unit_id}
                    labelIdentifier: "{third_created_box_label_identifier}"
                }} ) {{
                measureValue
                displayUnit {{ id }}
            }}
        }}"""
    updated_third_box = assert_successful_request(client, mutation)
    measure_value *= pound_unit["conversion_factor"] / gram_unit["conversion_factor"]
    rounded_measure_value = round(measure_value, 2)
    assert updated_third_box == {
        "displayUnit": {"id": new_unit_id},
        "measureValue": measure_value,
    }

    new_measure_value = 3.0  # in pound
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    measureValue: {new_measure_value}
                    labelIdentifier: "{third_created_box_label_identifier}"
                }} ) {{
                measureValue
                displayUnit {{ id }}
            }}
        }}"""
    updated_third_box = assert_successful_request(client, mutation)
    assert updated_third_box == {
        "displayUnit": {"id": new_unit_id},
        "measureValue": new_measure_value,
    }

    newest_measure_value = 1000.0  # in gram
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    displayUnitId: {unit_id}
                    measureValue: {newest_measure_value}
                    labelIdentifier: "{third_created_box_label_identifier}"
                }} ) {{
                measureValue
                displayUnit {{ id }}
            }}
        }}"""
    updated_third_box = assert_successful_request(client, mutation)
    assert updated_third_box == {
        "displayUnit": {"id": unit_id},
        "measureValue": newest_measure_value,
    }

    # Test case 8.2.11e
    # Switch measure-product -> size-product
    mutation = f"""mutation {{
            updateBox(
                updateInput : {{
                    productId: {product_id}
                    sizeId: {size_id}
                    labelIdentifier: "{third_created_box_label_identifier}"
                }} ) {{
                measureValue
                displayUnit {{ id }}
                size {{ id }}
                history {{
                    id
                    changes
                    user {{ name }}
                }}
            }}
        }}"""
    updated_third_box = assert_successful_request(client, mutation)
    assert updated_third_box == {
        "displayUnit": None,
        "measureValue": None,
        "size": {"id": size_id},
        "history": [
            {
                "id": "132",
                "changes": f"changed units of measure from {newest_measure_value}0g to "
                + '""',
                "user": {"name": "coord"},
            },
            {
                "id": "131",
                "changes": f"changed product type from {products[7]['name']} to "
                + f"{products[0]['name']}",
                "user": {"name": "coord"},
            },
            {
                "id": "130",
                "changes": f"changed units of measure from {new_measure_value}0lb to "
                + f"{newest_measure_value}0g",
                "user": {"name": "coord"},
            },
            {
                "id": "129",
                "changes": f"changed unit from {pound_unit['symbol']} to "
                + f"{gram_unit['symbol']}",
                "user": {"name": "coord"},
            },
            {
                "id": "128",
                "changes": f"changed units of measure from {rounded_measure_value}lb to"
                + f" {new_measure_value}0lb",
                "user": {"name": "coord"},
            },
            {
                "id": "127",
                "changes": f"changed unit from {gram_unit['symbol']} to "
                + f"{pound_unit['symbol']}",
                "user": {"name": "coord"},
            },
            {
                "id": "126",
                "changes": "created record",
                "user": {"name": "coord"},
            },
        ],
    }

    raw_label_identifiers = sorted(
        [created_box["labelIdentifier"], another_created_box_label_identifier]
    )
    label_identifiers = ",".join(f'"{i}"' for i in raw_label_identifiers)
    # Test case 8.2.22a, 8.2.22c
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}], locationId: {location_id} }} ) {{
                ...on BoxResult {{ updatedBoxes {{
                    location {{ id }}
                    lastModifiedOn
                    history {{ changes }}
                }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    moved_boxes = response["updatedBoxes"]
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
    assert response["invalidBoxLabelIdentifiers"] == [
        another_created_box_label_identifier
    ]

    # Test case 8.2.22i
    deleted_location_id = str(deleted_location["id"])
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}],
            locationId: {deleted_location_id} }} ) {{
                ...on DeletedLocationError {{ name }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"name": f"{deleted_location['name']}"}

    # Test case 8.2.23a, 8.2.23c
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [{"tags": [{"id": tag_id}]}],
        "invalidBoxLabelIdentifiers": [another_created_box_label_identifier],
    }

    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    generic_tag_id = str(tags[2]["id"])
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {generic_tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [
            {"tags": [{"id": tag_id}, {"id": generic_tag_id}]} for _ in range(2)
        ],
        "invalidBoxLabelIdentifiers": [],
    }

    another_generic_tag_id = str(tags[5]["id"])
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}],
            tagId: {another_generic_tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [
            {
                "tags": [
                    {"id": tag_id},
                    {"id": generic_tag_id},
                    {"id": another_generic_tag_id},
                ]
            }
            for _ in range(2)
        ],
        "invalidBoxLabelIdentifiers": [],
    }

    # Test case 8.2.24a
    label_identifier = f'"{created_box["labelIdentifier"]}"'
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifier}], tagId: {generic_tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [{"tags": [{"id": tag_id}, {"id": another_generic_tag_id}]}],
        "invalidBoxLabelIdentifiers": [],
    }
    query = f"""query {{ box(labelIdentifier: {label_identifier})
                    {{ history {{ changes }} }} }}"""
    response = assert_successful_request(client, query)
    history = response["history"]
    assert {"changes": f"""assigned tag '{tags[2]["name"]}' to box"""} in history
    assert {"changes": f"""removed tag '{tags[2]["name"]}' from box"""} in history

    # Verify that tag is not removed from the other box
    query = f"""query {{ box(labelIdentifier: "{another_created_box_label_identifier}")
                    {{ tags {{ id }} }} }}"""
    response = assert_successful_request(client, query)
    assert response == {
        "tags": [{"id": tag_id}, {"id": generic_tag_id}, {"id": another_generic_tag_id}]
    }

    # Test case 8.2.24c
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {generic_tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [{"tags": [{"id": tag_id}, {"id": another_generic_tag_id}]}],
        "invalidBoxLabelIdentifiers": [created_box["labelIdentifier"]],
    }

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
                ...on BoxResult {{
                    updatedBoxes {{ id }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test case 8.2.23i
    deleted_tag_id = str(tags[4]["id"])
    tag_name = tags[4]["name"]
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {deleted_tag_id} }} ) {{
                ...on DeletedTagError {{ name }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"name": tag_name}

    # Test case 8.2.24i
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {deleted_tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ id }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test case 8.2.25
    mutation = f"""mutation {{ deleteBoxes( labelIdentifiers: [{label_identifiers}] ) {{
            ...on BoxResult {{
                updatedBoxes {{
                    deletedOn
                    history {{ changes }}
                }}
                invalidBoxLabelIdentifiers
            }} }} }}"""
    response = assert_successful_request(client, mutation)
    for box in response["updatedBoxes"]:
        assert box["deletedOn"].startswith(today)
        assert box["history"][0]["changes"] == "deleted record"
    assert response["invalidBoxLabelIdentifiers"] == []

    # Test case 8.2.22b, 8.2.22d, 8.2.22h
    raw_label_identifiers = sorted(
        [
            another_box["label_identifier"],  # in base that user isn't authorized for
            created_box["labelIdentifier"],  # already deleted box
            "99119911",  # non-existing box
        ]
    )
    label_identifiers = ",".join(f'"{i}"' for i in raw_label_identifiers)
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}], locationId: {location_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ id }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test case 8.2.23b, 8.2.23d, 8.2.23j
    mutation = f"""mutation {{ assignTagToBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test case 8.2.24b, 8.2.24d, 8.2.24j
    mutation = f"""mutation {{ unassignTagFromBoxes( updateInput: {{
            labelIdentifiers: [{label_identifiers}], tagId: {tag_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ tags {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test cases 8.2.26, 8.2.27, 8.2.28
    mutation = f"""mutation {{ deleteBoxes( labelIdentifiers: [{label_identifiers}] ) {{
            ...on BoxResult {{
                updatedBoxes {{ id }}
                invalidBoxLabelIdentifiers
            }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [],
        "invalidBoxLabelIdentifiers": raw_label_identifiers,
    }

    # Test case 8.2.22j
    mock_user_for_request(mocker, base_ids=[1, 3])
    another_location_id = str(yet_another_location["id"])  # in base 3
    mutation = f"""mutation {{ moveBoxesToLocation( updateInput: {{
            labelIdentifiers: [{label_identifiers}],
            locationId: {another_location_id} }} ) {{
                ...on BoxResult {{
                    updatedBoxes {{ id location {{ id }} }}
                    invalidBoxLabelIdentifiers
                }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "updatedBoxes": [
            {"id": str(another_box["id"]), "location": {"id": another_location_id}}
        ],
        # Identifiers will be alphabetically sorted in the response
        "invalidBoxLabelIdentifiers": sorted(
            [created_box["labelIdentifier"], "99119911"]
        ),
    }

    # Test cases 8.2.1, 8.2.2., 8.2.11, 8.2.25
    history = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
            DbChangeHistory.from_float,
            DbChangeHistory.to_float,
            DbChangeHistory.record_id,
            DbChangeHistory.table_name,
            DbChangeHistory.user,
            DbChangeHistory.ip,
        )
        .order_by(DbChangeHistory.id)
        .dicts()
    )
    box_id = int(updated_box["id"])
    assert history[22:] == [
        {
            "changes": "Record created",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "Record created",
            "from_int": None,
            "to_int": None,
            "record_id": box_id + 1,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "Record created",
            "from_int": None,
            "to_int": None,
            "record_id": box_id + 2,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "product_id",
            "from_int": int(product_id),
            "to_int": int(new_product_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "size_id",
            "from_int": int(size_id),
            "to_int": int(new_size_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "items",
            "from_int": original_number_of_items,
            "to_int": nr_items,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "location_id",
            "from_int": int(location_id),
            "to_int": int(new_location_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": f"""comments changed from "" to "{comment}";""",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "box_state_id",
            "from_int": BoxState.InStock.value,
            "to_int": BoxState[state].value,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "product_id",
            "from_int": int(new_product_id),
            "ip": None,
            "record_id": box_id,
            "table_name": "stock",
            "to_int": int(measure_product_id),
            "user": 8,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "size_id",
            "from_int": int(new_size_id),
            "ip": None,
            "record_id": box_id,
            "table_name": "stock",
            "to_int": None,
            "user": 8,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "display_unit_id",
            "from_int": None,
            "ip": None,
            "record_id": box_id,
            "table_name": "stock",
            "to_int": int(unit_id),
            "user": 8,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": 'changed units of measure from "" to 250.00g',
            "from_int": None,
            "ip": None,
            "record_id": box_id,
            "table_name": "stock",
            "to_int": None,
            "user": 8,
            "from_float": None,
            "to_float": 0.25,
        },
        {
            "changes": "display_unit_id",
            "from_int": int(unit_id),
            "ip": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "to_int": int(new_unit_id),
            "user": 8,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": f"changed units of measure from {rounded_measure_value}lb to "
            f"{new_measure_value}0lb",
            "from_int": None,
            "ip": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "to_int": None,
            "user": 8,
            "from_float": 1.5,
            "to_float": round(new_measure_value / pound_unit["conversion_factor"], 5),
        },
        {
            "changes": "display_unit_id",
            "from_int": int(new_unit_id),
            "ip": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "to_int": int(unit_id),
            "user": 8,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": f"changed units of measure from {new_measure_value}0lb to "
            f"{newest_measure_value}0g",
            "from_int": None,
            "ip": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "to_int": None,
            "user": 8,
            "from_float": round(new_measure_value / pound_unit["conversion_factor"], 5),
            "to_float": newest_measure_value / gram_unit["conversion_factor"],
        },
        {
            "changes": "product_id",
            "from_int": int(measure_product_id),
            "to_int": int(product_id),
            "record_id": third_created_box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "size_id",
            "from_int": None,
            "to_int": int(size_id),
            "record_id": third_created_box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "display_unit_id",
            "from_int": int(unit_id),
            "to_int": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": f"changed units of measure from {newest_measure_value}0g to "
            + '""',
            "from_int": None,
            "ip": None,
            "record_id": third_created_box_id,
            "table_name": "stock",
            "to_int": None,
            "user": 8,
            "from_float": round(
                newest_measure_value / gram_unit["conversion_factor"], 5
            ),
            "to_float": None,
        },
        {
            "changes": "location_id",
            "from_int": int(new_location_id),
            "to_int": int(location_id),
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "box_state_id",
            "from_int": BoxState.Lost.value,
            "to_int": BoxState.InStock.value,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "Record deleted",
            "from_int": None,
            "to_int": None,
            "record_id": box_id,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "Record deleted",
            "from_int": None,
            "to_int": None,
            "record_id": box_id + 1,
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
        {
            "changes": "location_id",
            "from_int": 2,
            "to_int": int(another_location_id),
            "record_id": another_box["id"],
            "table_name": "stock",
            "user": 8,
            "ip": None,
            "from_float": None,
            "to_float": None,
        },
    ]


def test_update_box_tag_ids(client, default_box, tags):
    # Test case 8.2.11c
    label_identifier = default_box["label_identifier"]
    tag_id = str(tags[1]["id"])
    tag_name = tags[1]["name"]
    another_tag_id = str(tags[2]["id"])
    another_tag_name = tags[2]["name"]

    # Default box has tags 2 and 3 assigned already. Remove 2 and keep 3
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [{another_tag_id}] }} ) {{
                        history {{ changes }}
                        tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == [{"id": another_tag_id}]
    assert updated_box["history"][0] == {
        "changes": f"removed tag '{tag_name}' from box"
    }

    # Now add tag ID 2 back while keeping tag ID 3
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [{tag_id},{another_tag_id}] }} ) {{
                        history {{ changes }}
                        tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == [{"id": tag_id}, {"id": another_tag_id}]
    assert updated_box["history"][0] == {"changes": f"assigned tag '{tag_name}' to box"}

    time.sleep(1)
    # Remove all assigned tags when passing empty list
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIds: [] }} ) {{
                        history {{ changes }}
                        tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == []
    assert updated_box["history"][0] == {
        "changes": f"removed tag '{another_tag_name}' from box"
    }
    assert updated_box["history"][1] == {
        "changes": f"removed tag '{tag_name}' from box"
    }

    # Add tag ID 2
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{tag_id}] }} ) {{
                        history {{ changes }}
                        tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == [{"id": tag_id}]
    assert updated_box["history"][0] == {"changes": f"assigned tag '{tag_name}' to box"}
    assert updated_box["history"][1] == {
        "changes": f"removed tag '{another_tag_name}' from box"
    }

    time.sleep(1)
    # Add the same tag again without an error being thrown
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == [{"id": tag_id}]
    assert updated_box["history"][0] == {"changes": f"assigned tag '{tag_name}' to box"}
    assert updated_box["history"][1] == {
        "changes": f"removed tag '{another_tag_name}' from box"
    }

    time.sleep(1)
    # Add tag ID 3. Both tags are assigned to the box
    mutation = f"""mutation {{ updateBox(updateInput : {{
                    labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{another_tag_id}] }} ) {{
                        history {{ changes }}
                        tags {{ id }} }} }}"""
    updated_box = assert_successful_request(client, mutation)
    assert updated_box["tags"] == [{"id": tag_id}, {"id": another_tag_id}]
    assert updated_box["history"][0] == {
        "changes": f"assigned tag '{another_tag_name}' to box"
    }


def _format(parameter):
    try:
        return ",".join(f"{k}={v}" for f in parameter for k, v in f.items())
    except TypeError:
        return parameter  # integer number


@pytest.mark.parametrize(
    "filters,number",
    [
        # Test case 8.1.7
        [[{"states": "[InStock]"}], 2],
        [[{"states": "[Lost]"}], 1],
        [[{"states": "[MarkedForShipment]"}], 3],
        [[{"states": "[InTransit]"}], 2],
        [[{"states": "[Receiving]"}], 0],
        [[{"states": "[NotDelivered]"}], 2],
        [[{"states": "[InStock,Lost]"}], 3],
        [[{"states": "[Lost,MarkedForShipment]"}], 4],
        [[{"lastModifiedFrom": '"2020-01-01"'}], 14],
        [[{"lastModifiedFrom": '"2021-02-02"'}], 2],
        [[{"lastModifiedFrom": '"2022-01-01"'}], 0],
        [[{"lastModifiedUntil": '"2022-01-01"'}], 14],
        [[{"lastModifiedUntil": '"2020-11-27"'}], 12],
        [[{"lastModifiedUntil": '"2020-01-01"'}], 0],
        [[{"productGender": "Women"}], 13],
        [[{"productGender": "Men"}], 0],
        [[{"productId": "1"}], 11],
        [[{"productId": "2"}], 0],
        [[{"sizeId": "1"}], 12],
        [[{"sizeId": "2"}], 1],
        [[{"productCategoryId": "1"}], 13],
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
    "product_id,size_id,location_id,qr_code,unit_id,measure_value",
    [  # Test cases
        [0, 1, 1, "555", "null", "null"],  # 8.2.3, 8.2.12
        [1, 0, 1, "555", "null", "null"],  # 8.2.4, 8.2.13
        [1, 1, 0, "555", "null", "null"],  # 8.2.5, 8.2.14
        [1, 1, 1, "000", "null", "null"],  # 8.2.6
        [1, "null", 1, "555", 0, 100],  # 8.2.4a
    ],
)
def test_mutate_box_with_non_existing_resource(
    read_only_client,
    default_box,
    product_id,
    size_id,
    location_id,
    qr_code,
    unit_id,
    measure_value,
):
    creation_input = f"""{{
                    productId: {product_id},
                    locationId: {location_id},
                    sizeId: {size_id},
                    qrCode: "{qr_code}"
                    displayUnitId: {unit_id}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Box QR code cannot be updated, hence no errors possible
    if qr_code == "000" or measure_value == 100:
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


def test_mutate_box_with_invalid_input(
    read_only_client,
    default_box,
    measure_product_box,
    default_product,
    default_location,
    default_size,
    gram_unit,
    liter_unit,
    products,
):
    # Negative numberOfItems
    # Test case 8.2.10
    size_id = str(default_size["id"])
    location_id = str(default_location["id"])
    product_id = str(default_product["id"])
    mandatory_input = f"""productId: {product_id} locationId: {location_id}"""
    unit_id = str(gram_unit["id"])
    measure_value = 200
    creation_input = f"""{{ {mandatory_input}
                    sizeId: {size_id},
                    numberOfItems: -3
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10a
    creation_input = f"""{{
                    productId: {product_id}
                    locationId: {location_id}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10b
    creation_input = f"""{{ {mandatory_input}
                    sizeId: {size_id}
                    displayUnitId: {unit_id}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    creation_input = f"""{{ {mandatory_input}
                    sizeId: {size_id}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    creation_input = f"""{{ {mandatory_input}
                    sizeId: {size_id}
                    displayUnitId: {unit_id}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10c
    creation_input = f"""{{ {mandatory_input}
                    displayUnitId: {unit_id}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    creation_input = f"""{{ {mandatory_input}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10d - mismatch of product size range and unit dimension
    creation_input = f"""{{ {mandatory_input}
                    displayUnitId: {unit_id}
                    measureValue: {measure_value}
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10e
    creation_input = f"""{{ {mandatory_input}
                    displayUnitId: {unit_id}
                    measureValue: -200
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19
    label_identifier = default_box["label_identifier"]
    mandatory_input = f'labelIdentifier: "{label_identifier}"'
    update_input = f"""{{ {mandatory_input}
                numberOfItems: -5
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19a
    update_input = f"""{{ {mandatory_input}
                displayUnitId: {unit_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ {mandatory_input}
                measureValue: 100
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19b
    size_product_id = str(products[2]["id"])
    update_input = f"""{{ {mandatory_input}
                productId: {size_product_id}
                displayUnitId: {unit_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ {mandatory_input}
                productId: {size_product_id}
                measureValue: 100
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Switch from size product to measure product
    # Test case 8.2.19g
    measure_product_id = str(products[7]["id"])
    update_input = f"""{{ {mandatory_input}
                productId: {measure_product_id}
                sizeId: {size_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19h
    update_input = f"""{{ {mandatory_input}
                productId: {measure_product_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ {mandatory_input}
                productId: {measure_product_id}
                measureValue: 1000
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19i
    update_input = f"""{{ {mandatory_input}
                productId: {measure_product_id}
                measureValue: -1000
                displayUnitId: {unit_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19j
    liter_unit_id = str(liter_unit["id"])
    update_input = f"""{{ {mandatory_input}
                productId: {measure_product_id}
                measureValue: 1000
                displayUnitId: {liter_unit_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Operations on measure-product boxes
    # Test case 8.2.19c
    label_identifier = measure_product_box["label_identifier"]
    mandatory_input = f'labelIdentifier: "{label_identifier}"'
    update_input = f"""{{ {mandatory_input}
                sizeId: 1
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19d
    update_input = f"""{{ {mandatory_input}
                measureValue: -50
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Mismatch of product size range (mass) and unit dimension (volume)
    # Test case 8.2.19e
    update_input = f"""{{ {mandatory_input}
                displayUnitId: {liter_unit_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19c
    another_measure_product_id = str(products[8]["id"])
    update_input = f"""{{ {mandatory_input}
                productId: {another_measure_product_id}
                sizeId: 1
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19d
    update_input = f"""{{ {mandatory_input}
                productId: {another_measure_product_id}
                measureValue: -50
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19f
    update_input = f"""{{ {mandatory_input}
                productId: {another_measure_product_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19k
    update_input = f"""{{ {mandatory_input}
                productId: {size_product_id}
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19m
    update_input = f"""{{ {mandatory_input}
                productId: {size_product_id}
                sizeId: {size_id}
                measureValue: 100
            }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ {mandatory_input}
                productId: {size_product_id}
                sizeId: {size_id}
                displayUnitId: {unit_id}
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
    for query in queries.values():
        assert_forbidden_request(read_only_client, query)
    for query in qr_queries.values():
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


def test_mutate_box_with_invalid_location_or_product(
    read_only_client,
    mocker,
    default_product,
    default_box,
    another_product,
    default_location,
    another_location,
    default_size,
    tags,
):
    mock_user_for_request(mocker, base_ids=[1, 3])

    # Test case 8.2.10f
    # Product is registered in base 1, and location is from base 3; and vice versa
    creation_input = f"""{{
                    productId: {default_product["id"]},
                    locationId: {another_location["id"]},
                    sizeId: {default_size["id"]},
                    numberOfItems: 2,
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    creation_input = f"""{{
                    productId: {another_product["id"]},
                    locationId: {default_location["id"]},
                    sizeId: {default_size["id"]},
                    numberOfItems: 2,
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.10g
    creation_input = f"""{{
                    productId: {default_product["id"]},
                    locationId: {default_location["id"]},
                    sizeId: {default_size["id"]},
                    numberOfItems: 2,
                    tagIds: [{tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    creation_input = f"""{{
                    productId: {default_product["id"]},
                    locationId: {default_location["id"]},
                    sizeId: {default_size["id"]},
                    numberOfItems: 2,
                    tagIds: [{tags[5]["id"]}, {tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            createBox( creationInput : {creation_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.11n, 8.2.11o
    label_identifier = default_box["label_identifier"]
    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                         locationId: {another_location["id"]} }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                         productId: {another_product["id"]} }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                         locationId: {default_location["id"]}
                         productId: {another_product["id"]} }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                         locationId: {another_location["id"]}
                         productId: {default_product["id"]} }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                         locationId: {another_location["id"]}
                         productId: {another_product["id"]} }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ id }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    # Test case 8.2.19p
    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                    tagIds: [{tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                    tagIds: [{tags[5]["id"]}, {tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)

    update_input = f"""{{ labelIdentifier: "{label_identifier}"
                    tagIdsToBeAdded: [{tags[5]["id"]}, {tags[6]["id"]}]
                }}"""
    mutation = f"""mutation {{
            updateBox( updateInput : {update_input} ) {{ labelIdentifier }} }}"""
    assert_bad_user_input(read_only_client, mutation)
