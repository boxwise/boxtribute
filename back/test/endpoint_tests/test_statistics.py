from utils import assert_successful_request


def test_query_beneficiary_demographics(read_only_client, tags):
    query = """query { beneficiaryDemographics(baseIds: [1]) {
        facts { gender age createdOn count tagIds }
        dimensions { tag { id name color } } } }"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert len(response["facts"]) == 2
    assert response["dimensions"] == {
        "tag": [
            {"id": str(tag["id"]), "name": tag["name"], "color": tag["color"]}
            for tag in [tags[0], tags[2]]
        ]
    }

    query = """query { beneficiaryDemographics {
        facts { gender age createdOn count tagIds } } }"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert len(response["facts"]) == 3


def test_query_created_boxes(read_only_client, products, product_categories):
    query = """query { createdBoxes {
        facts {
            createdOn categoryId productId gender boxesCount itemsCount
        }
        dimensions {
            product { id name }
            category { id name }
    } } }"""
    data = assert_successful_request(read_only_client, query, endpoint="public")
    facts = data.pop("facts")
    assert len(facts) == 3
    assert facts[0]["boxesCount"] == 9
    assert facts[1]["boxesCount"] == 2
    assert data == {
        "dimensions": {
            "product": [{"id": str(p["id"]), "name": p["name"]} for p in products[:3]],
            "category": [
                {"id": str(c["id"]), "name": c["name"]}
                for c in sorted(product_categories, key=lambda c: c["id"])
            ],
        }
    }

    query = """query { createdBoxes(baseId: 1) { facts { boxesCount } } }"""
    data = assert_successful_request(read_only_client, query, endpoint="public")
    assert data == {"facts": [{"boxesCount": 9}, {"boxesCount": 1}]}


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
):
    query = """query { topProductsCheckedOut(baseId: 1) {
        facts { checkedOutOn productId categoryId rank itemsCount }
        dimensions { product { id name } } } }"""
    data = assert_successful_request(read_only_client, query, endpoint="public")
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
    data = assert_successful_request(read_only_client, query, endpoint="public")
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
