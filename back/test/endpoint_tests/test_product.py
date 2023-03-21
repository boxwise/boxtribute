from utils import assert_successful_request


def test_product_query(read_only_client, default_product, default_size, another_size):
    # Test case 8.1.21
    query = f"""query {{
                product(id: {default_product['id']}) {{
                    id
                    name
                    category {{
                        hasGender
                    }}
                    sizeRange {{ id sizes {{ id }} }}
                    base {{ id }}
                    price
                    gender
                    createdBy {{ id }}
                    deleted
                }}
            }}"""
    queried_product = assert_successful_request(read_only_client, query)
    assert queried_product == {
        "id": str(default_product["id"]),
        "name": default_product["name"],
        "category": {"hasGender": True},
        "sizeRange": {
            "id": str(default_product["size_range"]),
            "sizes": [{"id": str(default_size["id"])}, {"id": str(another_size["id"])}],
        },
        "base": {"id": str(default_product["base"])},
        "price": default_product["price"],
        "gender": "Women",
        "createdBy": {"id": str(default_product["created_by"])},
        "deleted": None,
    }


def test_products_query(read_only_client, base1_products):
    query = """query { products { elements { name } } }"""
    products = assert_successful_request(read_only_client, query)["elements"]
    assert products == [{"name": p["name"]} for p in base1_products]
