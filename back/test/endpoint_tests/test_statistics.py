from datetime import date, datetime

from auth import mock_user_for_request
from boxtribute_server.business_logic.statistics.crud import (
    number_of_boxes_moved_between,
)
from boxtribute_server.enums import BoxState, ProductGender, TargetType
from boxtribute_server.models.definitions.box import Box
from boxtribute_server.models.definitions.location import Location
from boxtribute_server.models.utils import compute_age
from utils import assert_forbidden_request, assert_successful_request


def test_query_beneficiary_demographics(
    client, tags, default_beneficiary, another_male_beneficiary
):
    query = """query { beneficiaryDemographics(baseId: 1) {
        facts { gender age createdOn deletedOn count tagIds }
        dimensions { tag { id name color } } } }"""
    response = assert_successful_request(client, query, endpoint="graphql")
    age = compute_age(default_beneficiary["date_of_birth"])
    assert response["facts"] == [
        {
            "age": age,
            "count": 1,
            "createdOn": "2020-06-30",
            "deletedOn": None,
            "gender": "Male",
            "tagIds": [1, 3],
        },
        {
            "age": None,
            "count": 1,
            "createdOn": "2021-06-30",
            "deletedOn": "2021-12-31",
            "gender": "Diverse",
            "tagIds": [],
        },
        {
            "age": None,
            "count": 1,
            "createdOn": "2022-01-30",
            "deletedOn": None,
            "gender": "Female",
            "tagIds": [],
        },
        {
            "age": None,
            "count": 1,
            "createdOn": "2021-06-30",
            "deletedOn": None,
            "gender": "Diverse",
            "tagIds": [],
        },
        {
            "age": age,
            "count": 1,
            "createdOn": another_male_beneficiary["created_on"].date().isoformat(),
            "deletedOn": None,
            "gender": "Male",
            "tagIds": [1],
        },
    ]
    assert response["dimensions"] == {
        "tag": [
            {"id": tag["id"], "name": tag["name"], "color": tag["color"]}
            for tag in [tags[0], tags[2]]
        ]
    }


def test_query_created_boxes(
    client, base1_undeleted_products, product_categories, tags
):
    query = """query { createdBoxes(baseId: 1) {
        facts {
            createdOn categoryId productId gender boxesCount itemsCount tagIds
        }
        dimensions {
            product { id name gender }
            category { id name }
            tag { id }
    } } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    # Sanity check
    nr_created_boxes = Box.select().join(Location).where(Location.base == 1).count()
    assert nr_created_boxes == sum(f["boxesCount"] for f in data["facts"])
    expected_facts = [
        {
            "boxesCount": 1,
            "itemsCount": 5,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 1,
            "gender": "Women",
            "productId": 1,
            "tagIds": [2, 3],
        },
        {
            "boxesCount": 2,
            "itemsCount": 20,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 1,
            "gender": "Women",
            "productId": 1,
            "tagIds": [3],
        },
        {
            "boxesCount": 7,
            "itemsCount": 70,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 1,
            "gender": "Women",
            "productId": 1,
            "tagIds": [],
        },
        {
            "boxesCount": 1,
            "itemsCount": 12,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 1,
            "gender": "Women",
            "productId": 3,
            "tagIds": [],
        },
        {
            "boxesCount": 2,
            "itemsCount": 22,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 12,
            "gender": "Boy",
            "productId": 5,
            "tagIds": [],
        },
        {
            "boxesCount": 1,
            "itemsCount": 10,
            "createdOn": "2020-11-27T00:00:00",
            "categoryId": 1,
            "gender": "Women",
            "productId": 8,
            "tagIds": [],
        },
    ]
    assert len(data["facts"]) == len(expected_facts)

    def _fact_sort_key(fact):
        return (
            fact["createdOn"],
            fact["categoryId"],
            fact["productId"],
            fact["gender"],
            tuple(fact["tagIds"]),
            fact["boxesCount"],
            fact["itemsCount"],
        )

    assert sorted(data["facts"], key=_fact_sort_key) == sorted(
        expected_facts, key=_fact_sort_key
    )
    assert data["dimensions"] == {
        "product": [
            {
                "id": p["id"],
                "name": p["name"],
                "gender": ProductGender(p["gender"]).name,
            }
            # last product is not present in any box
            for p in base1_undeleted_products[:-1]
        ],
        "category": [
            {"id": c["id"], "name": c["name"]}
            for c in sorted(product_categories, key=lambda c: c["id"])
        ],
        "tag": [{"id": t["id"]} for t in [tags[1], tags[2]]],
    }


def test_query_top_products(
    client,
    default_product,
    products,
    default_transaction,
    relative_transaction,
    another_transaction,
    default_box,
    default_size,
    another_size,
):
    query = """query { topProductsCheckedOut(baseId: 1) {
        facts { checkedOutOn productId categoryId rank itemsCount }
        dimensions { product { id name } } } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    assert data == {
        "facts": [
            {
                "checkedOutOn": relative_transaction["created_on"].date().isoformat(),
                "productId": default_product["id"],
                "categoryId": default_product["category"],
                "itemsCount": 9,
                "rank": 1,
            },
            {
                "checkedOutOn": another_transaction["created_on"].date().isoformat(),
                "productId": products[2]["id"],
                "categoryId": products[2]["category"],
                "itemsCount": another_transaction["count"],
                "rank": 2,
            },
            {
                "checkedOutOn": default_transaction["created_on"].date().isoformat(),
                "productId": default_product["id"],
                "categoryId": default_product["category"],
                "itemsCount": default_transaction["count"],
                "rank": 3,
            },
        ],
        "dimensions": {
            "product": [
                {"id": products[i]["id"], "name": products[i]["name"]} for i in [0, 2]
            ],
        },
    }

    query = """query { topProductsDonated(baseId: 1) {
        facts { createdOn donatedOn sizeId productId categoryId rank itemsCount }
        dimensions { product { id name } size { id name } } } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    assert data == {
        "facts": [
            {
                "createdOn": default_box["created_on"].date().isoformat(),
                "donatedOn": "2022-12-05",
                "productId": default_product["id"],
                "categoryId": default_product["category"],
                "sizeId": default_size["id"],
                "itemsCount": 20,
                "rank": 1,
            },
            {
                "createdOn": default_box["created_on"].date().isoformat(),
                "donatedOn": "2022-12-05",
                "productId": products[4]["id"],
                "categoryId": products[4]["category"],
                "sizeId": default_size["id"],
                "itemsCount": 12,
                "rank": 2,
            },
            {
                "createdOn": default_box["created_on"].date().isoformat(),
                "donatedOn": "2022-12-05",
                "productId": products[2]["id"],
                "categoryId": products[2]["category"],
                "sizeId": another_size["id"],
                "itemsCount": 12,
                "rank": 2,
            },
        ],
        "dimensions": {
            "product": [
                {"id": products[i]["id"], "name": products[i]["name"]}
                for i in [0, 2, 4]
            ],
            "size": [
                {"id": s["id"], "name": s["label"]}
                for s in [default_size, another_size]
            ],
        },
    }


def test_query_moved_boxes(
    client,
    default_location,
    default_base,
    another_base,
    default_organisation,
    another_organisation,
):
    query = """query { movedBoxes(baseId: 1) {
        facts {
            movedOn targetId categoryId productName gender sizeId tagIds
            absoluteMeasureValue dimensionId organisationName boxesCount itemsCount
        }
        dimensions { target { id name type } }
        } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    location_name = default_location["name"]
    base_name = another_base["name"]
    org_name = another_organisation["name"]
    assert data == {
        "facts": [
            {
                "boxesCount": 2,
                "itemsCount": 20,
                "categoryId": 1,
                "productName": "indigestion tablets",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": location_name,
                "organisationName": None,
                "movedOn": "2022-12-05",
                "tagIds": [],
            },
            {
                "boxesCount": 1,
                "itemsCount": 12,
                "categoryId": 12,
                "productName": "joggers",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Boy",
                "targetId": location_name,
                "organisationName": None,
                "movedOn": "2022-12-05",
                "tagIds": [],
            },
            {
                "boxesCount": 1,
                "itemsCount": 12,
                "categoryId": 1,
                "productName": "jackets",
                "sizeId": 2,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": location_name,
                "organisationName": None,
                "movedOn": "2022-12-05",
                "tagIds": [],
            },
            {
                "boxesCount": 3,
                "itemsCount": 30,
                "categoryId": 1,
                "productName": "indigestion tablets",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": base_name,
                "organisationName": org_name,
                "movedOn": date.today().isoformat(),
                "tagIds": [],
            },
            {
                "boxesCount": 1,
                "itemsCount": 10,
                "categoryId": 1,
                "productName": "indigestion tablets",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": base_name,
                "organisationName": org_name,
                "movedOn": date.today().isoformat(),
                "tagIds": [3],
            },
            {
                "boxesCount": 1,
                "itemsCount": 10,
                "categoryId": 1,
                "productName": "new product",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": base_name,
                "organisationName": org_name,
                "movedOn": date.today().isoformat(),
                "tagIds": [],
            },
            {
                "boxesCount": 1,
                "itemsCount": 10,
                "categoryId": 1,
                "productName": "indigestion tablets",
                "sizeId": 1,
                "absoluteMeasureValue": None,
                "dimensionId": None,
                "gender": "Women",
                "targetId": BoxState.Lost.name,
                "organisationName": None,
                "movedOn": "2023-02-01",
                "tagIds": [],
            },
        ],
        "dimensions": {
            "target": [
                {
                    "id": location_name,
                    "name": location_name,
                    "type": TargetType.OutgoingLocation.name,
                },
                {
                    "id": base_name,
                    "name": base_name,
                    "type": TargetType.Shipment.name,
                },
                {
                    "id": BoxState.Lost.name,
                    "name": BoxState.Lost.name,
                    "type": TargetType.BoxState.name,
                },
            ],
        },
    }

    total_boxes_count = sum(fact["boxesCount"] for fact in data["facts"])
    result = number_of_boxes_moved_between(datetime(2022, 12, 1), datetime.today())
    assert len(result) == 4
    assert result[0] == {
        "base_id": default_base["id"],
        "base_name": default_base["name"],
        "organisation_id": default_organisation["id"],
        "organisation_name": default_organisation["name"],
        "number": total_boxes_count,
    }


def test_query_stock_overview(client, default_product, default_location):
    query = """query { stockOverview(baseId: 1) {
        facts { categoryId productName gender sizeId locationId boxState tagIds
            absoluteMeasureValue dimensionId itemsCount boxesCount }
        dimensions { location { id name } dimension { id name } }
    } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    product_name = default_product["name"].strip().lower()
    assert data["dimensions"] == {
        "location": [{"id": default_location["id"], "name": default_location["name"]}],
        "dimension": [{"id": 28, "name": "Mass"}, {"id": 29, "name": "Volume"}],
    }
    assert data["facts"] == [
        {
            "boxState": BoxState.InStock.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 5,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [2, 3],
        },
        {
            "boxState": BoxState.MarkedForShipment.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [3],
        },
        {
            "boxState": BoxState.Lost.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.MarkedForShipment.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.InTransit.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [3],
        },
        {
            "boxState": BoxState.InTransit.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.Donated.name,
            "boxesCount": 2,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 20,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.NotDelivered.name,
            "boxesCount": 2,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 20,
            "locationId": 1,
            "productName": product_name,
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.Donated.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 12,
            "locationId": 1,
            "productName": "jackets",
            "sizeId": 2,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.MarkedForShipment.name,
            "boxesCount": 1,
            "categoryId": 12,
            "gender": "Boy",
            "itemsCount": 10,
            "locationId": 1,
            "productName": "joggers",
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.Donated.name,
            "boxesCount": 1,
            "categoryId": 12,
            "gender": "Boy",
            "itemsCount": 12,
            "locationId": 1,
            "productName": "joggers",
            "sizeId": 1,
            "absoluteMeasureValue": None,
            "dimensionId": None,
            "tagIds": [],
        },
        {
            "boxState": BoxState.InStock.name,
            "boxesCount": 1,
            "categoryId": 1,
            "gender": "Women",
            "itemsCount": 10,
            "locationId": 1,
            "productName": "rice",
            "sizeId": None,
            "absoluteMeasureValue": 0.5,
            "dimensionId": 28,
            "tagIds": [],
        },
    ]


def test_authorization(client, mocker):
    # Test case 11.1.4
    # Current user is from base 1 of organisation 1.
    # Hence the user is not allowed to access base 2 from organisation 1
    query = "query { createdBoxes(baseId: 2) { facts { productId } } }"
    assert_forbidden_request(client, query)

    # Test case 11.1.2
    # An accepted agreement exists between orgs 1 and 2 for bases 1+2 and 3.
    # Hence the user is allowed to access stock-related data from base 3
    for query in [
        "query { createdBoxes(baseId: 3) { facts { productId } } }",
        "query { topProductsDonated(baseId: 3) { facts { productId } } }",
        "query { movedBoxes(baseId: 3) { facts { categoryId } } }",
        "query { stockOverview(baseId: 3) { facts { categoryId } } }",
    ]:
        assert_successful_request(client, query)
    # Test case 11.1.3
    # ...but not beneficiary-related data
    for query in [
        "query { beneficiaryDemographics(baseId: 3) { facts { age } } }",
        "query { topProductsCheckedOut(baseId: 3) { facts { productId } } }",
    ]:
        assert_forbidden_request(client, query)

    # Test case 11.1.4
    # There's no agreement that involves base 1 and base 4
    # Hence the user is not allowed to access data from base 4
    for query in [
        "query { beneficiaryDemographics(baseId: 4) { facts { age } } }",
        "query { createdBoxes(baseId: 4) { facts { productId } } }",
        "query { topProductsCheckedOut(baseId: 4) { facts { productId } } }",
        "query { topProductsDonated(baseId: 4) { facts { productId } } }",
        "query { movedBoxes(baseId: 4) { facts { categoryId } } }",
        "query { stockOverview(baseId: 4) { facts { categoryId } } }",
    ]:
        assert_forbidden_request(client, query)

    # Test case 11.1.5
    # Base 99 does not exist
    query = "query { createdBoxes(baseId: 99) { facts { productId } } }"
    assert_forbidden_request(client, query)

    # Test case 11.1.6
    # User lacks 'product_category:read' permission
    mock_user_for_request(mocker, permissions=[])
    query = "query { createdBoxes(baseId: 1) { facts { productId } } }"
    assert_forbidden_request(client, query)

    # User lacks 'stock:read' permission
    mock_user_for_request(mocker, permissions=["product_category:read"])
    query = "query { createdBoxes(baseId: 1) { facts { productId } } }"
    assert_forbidden_request(client, query)

    query = "query { createdBoxes(baseId: 3) { facts { productId } } }"
    assert_forbidden_request(client, query)

    # User lacks 'beneficiary:read' permission
    mock_user_for_request(mocker, permissions=["tag_relation:read"])
    query = "query { beneficiaryDemographics(baseId: 1) { facts { age } } }"
    assert_forbidden_request(client, query)


def test_statistics_after_create_box_from_box(
    client,
    default_location,
    default_product,
    default_size,
    non_default_box_state_location,
):
    # Create a large box with default product, location, size and 100 items
    location_id = str(default_location["id"])
    product_id = str(default_product["id"])
    size_id = str(default_size["id"])
    original_number_of_items = 100

    creation_input = f"""{{
        productId: {product_id},
        locationId: {location_id},
        sizeId: {size_id},
        numberOfItems: {original_number_of_items},
    }}"""
    mutation = f"""mutation {{
        createBox( creationInput : {creation_input} ) {{
            labelIdentifier
            numberOfItems
            product {{ id name gender }}
            size {{ id }}
        }}
    }}"""
    created_box = assert_successful_request(client, mutation)
    label_identifier = created_box["labelIdentifier"]
    product_name = created_box["product"]["name"].strip().lower()
    product_gender = created_box["product"]["gender"]

    # Obtain createdBoxes statistic. It should contain the newly created large box
    query = """query { createdBoxes(baseId: 1) {
        facts {
            createdOn productId boxesCount itemsCount
        }
    } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    # Find the newly created box in statistics
    today = date.today().isoformat()
    created_box_facts = [
        f
        for f in data["facts"]
        if f["createdOn"] == f"{today}T00:00:00" and f["productId"] == int(product_id)
    ]
    assert len(created_box_facts) == 1
    assert created_box_facts[0]["boxesCount"] == 1
    assert created_box_facts[0]["itemsCount"] == original_number_of_items

    # use createBoxFromBox with a Donated location to create a new box with 10 items
    donated_location_id = str(non_default_box_state_location["id"])
    donated_location_name = non_default_box_state_location["name"]
    new_box_items = 10

    mutation = f"""mutation {{ createBoxFromBox( creationInput: {{
        sourceBoxLabelIdentifier: "{label_identifier}"
        locationId: {donated_location_id}
        numberOfItems: {new_box_items}
    }} ) {{
        ...on Box {{
            labelIdentifier
            numberOfItems
            location {{ id name }}
        }}
    }} }}"""
    new_box = assert_successful_request(client, mutation)
    assert new_box["numberOfItems"] == new_box_items
    assert new_box["location"]["id"] == donated_location_id

    # use createBoxFromBox with an InStock location to create 2nd new box with 10 items
    mutation = f"""mutation {{ createBoxFromBox( creationInput: {{
        sourceBoxLabelIdentifier: "{label_identifier}"
        locationId: {location_id}
        numberOfItems: {new_box_items}
    }} ) {{
        ...on Box {{
            labelIdentifier
            numberOfItems
            location {{ id name }}
        }}
    }} }}"""
    another_new_box = assert_successful_request(client, mutation)
    assert another_new_box["numberOfItems"] == new_box_items
    assert another_new_box["location"]["id"] == location_id
    # Move the second box to a Donated location
    mutation = f"""mutation {{ updateBox( updateInput: {{
        labelIdentifier: "{another_new_box['labelIdentifier']}"
        locationId: {donated_location_id}
    }} ) {{ location {{ id }} }} }}"""
    another_new_box = assert_successful_request(client, mutation)
    assert another_new_box["location"]["id"] == donated_location_id

    # Obtain createdBoxes statistic for base 1. It should contain the newly created
    # large box and the newly created small boxes but 100 for itemsCount
    data = assert_successful_request(client, query, endpoint="graphql")
    created_box_facts = [
        f
        for f in data["facts"]
        if f["createdOn"] == f"{today}T00:00:00" and f["productId"] == int(product_id)
    ]
    assert len(created_box_facts) == 1
    # Total items should still be 100 (80 in original + 2x10 in new boxes)
    assert created_box_facts[0]["boxesCount"] == 3
    assert created_box_facts[0]["itemsCount"] == original_number_of_items

    # Obtain movedBoxes statistic for base 1. It should contain the newly created small
    # boxes with the location name as targetId
    query = """query { movedBoxes(baseId: 1) {
        facts {
            movedOn gender targetId productName boxesCount itemsCount
        }
    } }"""
    data = assert_successful_request(client, query, endpoint="graphql")
    # Find the newly created box in movedBoxes statistics
    moved_box_facts = [
        f
        for f in data["facts"]
        if f["movedOn"] == today
        and f["targetId"] == donated_location_name
        and f["productName"] == product_name
    ]
    assert len(moved_box_facts) == 1
    assert moved_box_facts[0]["boxesCount"] == 2
    assert moved_box_facts[0]["itemsCount"] == 2 * new_box_items
    assert moved_box_facts[0]["gender"] == product_gender
