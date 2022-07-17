from utils import assert_successful_request


def test_product_query(read_only_client, default_product, default_size):
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
                }}
            }}"""
    queried_product = assert_successful_request(read_only_client, query)
    assert queried_product == {
        "id": str(default_product["id"]),
        "name": default_product["name"],
        "category": {"hasGender": True},
        "sizeRange": {
            "id": str(default_product["size_range"]),
            "sizes": [{"id": str(default_size["id"])}],
        },
        "base": {"id": str(default_product["base"])},
        "price": default_product["price"],
        "gender": "Women",
        "createdBy": None,
    }


def test_products_query(read_only_client, default_product):
    query = """query { products { elements { name } } }"""
    queried_product = assert_successful_request(read_only_client, query)["elements"][0]
    assert queried_product["name"] == default_product["name"]
