from datetime import date

import pytest
from auth import mock_user_for_request
from boxtribute_server.enums import BoxState, ProductGender, TargetType
from boxtribute_server.models.utils import compute_age
from utils import (
    assert_bad_user_input,
    assert_forbidden_request,
    assert_successful_request,
)


@pytest.mark.parametrize("endpoint", ["graphql", "public"])
def test_query_beneficiary_demographics(
    read_only_client, tags, default_beneficiary, endpoint
):
    query = """query { beneficiaryDemographics(baseId: 1) {
        facts { gender age createdOn count tagIds }
        dimensions { tag { id name color } } } }"""
    response = assert_successful_request(read_only_client, query, endpoint=endpoint)
    age = compute_age(default_beneficiary["date_of_birth"])
    assert response["facts"] == [
        {
            "age": None,
            "count": 1,
            "createdOn": "2022-01-30",
            "gender": "Female",
            "tagIds": [],
        },
        {
            "age": age,
            "count": 1,
            "createdOn": "2020-06-30",
            "gender": "Male",
            "tagIds": [1, 3],
        },
    ]
    assert response["dimensions"] == {
        "tag": [
            {"id": str(tag["id"]), "name": tag["name"], "color": tag["color"]}
            for tag in [tags[0], tags[2]]
        ]
    }


@pytest.mark.parametrize("endpoint", ["graphql", "public"])
def test_query_created_boxes(read_only_client, products, product_categories, endpoint):
    query = """query { createdBoxes(baseId: 1) {
        facts {
            createdOn categoryId productId gender boxesCount itemsCount
        }
        dimensions {
            product { id name gender }
            category { id name }
    } } }"""
    data = assert_successful_request(read_only_client, query, endpoint=endpoint)
    facts = data.pop("facts")
    assert len(facts) == 2
    assert facts[0]["boxesCount"] == 11
    assert facts[1]["boxesCount"] == 1
    assert data == {
        "dimensions": {
            "product": [
                {
                    "id": str(p["id"]),
                    "name": p["name"],
                    "gender": ProductGender(p["gender"]).name,
                }
                for p in [products[0], products[2]]
            ],
            "category": [
                {"id": str(c["id"]), "name": c["name"]}
                for c in sorted(product_categories, key=lambda c: c["id"])
            ],
        }
    }


@pytest.mark.parametrize("endpoint", ["graphql", "public"])
def test_query_top_products(
    read_only_client,
    default_product,
    products,
    default_transaction,
    relative_transaction,
    another_transaction,
    default_box,
    default_size,
    another_size,
    endpoint,
):
    query = """query { topProductsCheckedOut(baseId: 1) {
        facts { checkedOutOn productId categoryId rank itemsCount }
        dimensions { product { id name } } } }"""
    data = assert_successful_request(read_only_client, query, endpoint=endpoint)
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
                {"id": str(products[i]["id"]), "name": products[i]["name"]}
                for i in [0, 2]
            ],
        },
    }

    query = """query { topProductsDonated(baseId: 1) {
        facts { createdOn donatedOn sizeId productId categoryId rank itemsCount }
        dimensions { product { id name } size { id name } } } }"""
    data = assert_successful_request(read_only_client, query, endpoint=endpoint)
    assert data == {
        "facts": [
            {
                "createdOn": default_box["created_on"].date().isoformat(),
                "donatedOn": "2022-12-05",
                "productId": default_product["id"],
                "categoryId": default_product["category"],
                "sizeId": default_size["id"],
                "itemsCount": 22,
                "rank": 1,
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
                {"id": str(products[i]["id"]), "name": products[i]["name"]}
                for i in [0, 2]
            ],
            "size": [
                {"id": str(s["id"]), "name": s["label"]}
                for s in [default_size, another_size]
            ],
        },
    }


@pytest.mark.parametrize("endpoint", ["graphql", "public"])
def test_query_moved_boxes(read_only_client, default_location, default_bases, endpoint):
    query = """query { movedBoxes(baseId: 1) {
        facts { movedOn targetId categoryId boxesCount }
        dimensions { target { id name type } }
        } }"""
    data = assert_successful_request(read_only_client, query, endpoint=endpoint)
    location_name = default_location["name"]
    base_name = default_bases[3]["name"]
    assert data == {
        "facts": [
            {
                "boxesCount": 3,
                "categoryId": 1,
                "targetId": location_name,
                "movedOn": "2022-12-05",
            },
            {
                "boxesCount": 5,
                "categoryId": 1,
                "targetId": base_name,
                "movedOn": date.today().isoformat(),
            },
            {
                "boxesCount": 1,
                "categoryId": 1,
                "targetId": BoxState.Lost.name,
                "movedOn": "2023-02-01",
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


def test_authorization(read_only_client, mocker):
    # Current user is from base 1 of organisation 1.
    # Hence the user is not allowed to access base 2 from organisation 1
    query = "query { beneficiaryDemographics(baseId: 2) { facts { age } } }"
    assert_forbidden_request(read_only_client, query)

    # An accepted agreement exists between orgs 1 and 2 for bases 1+2 and 3.
    # Hence the user is allowed to access data from base 3
    for query in [
        "query { beneficiaryDemographics(baseId: 3) { facts { age } } }",
        "query { createdBoxes(baseId: 3) { facts { productId } } }",
        "query { topProductsCheckedOut(baseId: 3) { facts { productId } } }",
        "query { topProductsDonated(baseId: 3) { facts { productId } } }",
        "query { movedBoxes(baseId: 3) { facts { categoryId } } }",
    ]:
        assert_successful_request(read_only_client, query)

    # There's no agreement that involves base 1 and base 4
    # Hence the user is not allowed to access data from base 4
    for query in [
        "query { beneficiaryDemographics(baseId: 4) { facts { age } } }",
        "query { createdBoxes(baseId: 4) { facts { productId } } }",
        "query { topProductsCheckedOut(baseId: 4) { facts { productId } } }",
        "query { topProductsDonated(baseId: 4) { facts { productId } } }",
        "query { movedBoxes(baseId: 4) { facts { categoryId } } }",
    ]:
        assert_forbidden_request(read_only_client, query)

    # Base 5 does not exist
    query = "query { beneficiaryDemographics(baseId: 5) { facts { age } } }"
    assert_forbidden_request(read_only_client, query)

    # User lacks 'tag_relation:read' permission
    mock_user_for_request(mocker, permissions=[])
    query = "query { beneficiaryDemographics(baseId: 1) { facts { age } } }"
    assert_forbidden_request(read_only_client, query)

    # User lacks 'beneficiary:read' permission
    mock_user_for_request(mocker, permissions=["tag_relation:read"])
    query = "query { beneficiaryDemographics(baseId: 1) { facts { age } } }"
    assert_forbidden_request(read_only_client, query)

    query = "query { beneficiaryDemographics(baseId: 3) { facts { age } } }"
    assert_forbidden_request(read_only_client, query)


def test_public_query_validation(read_only_client):
    for query in [
        "query { beneficiaryDemographics(baseId: 5) { facts { age } } }",
        "query { createdBoxes(baseId: 5) { facts { productId } } }",
        "query { topProductsCheckedOut(baseId: 5) { facts { productId } } }",
        "query { topProductsDonated(baseId: 5) { facts { productId } } }",
        "query { movedBoxes(baseId: 5) { facts { categoryId } } }",
    ]:
        assert_bad_user_input(read_only_client, query, endpoint="public")
