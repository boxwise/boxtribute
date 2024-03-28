from datetime import date

from boxtribute_server.enums import ProductGender
from utils import assert_successful_request

today = date.today().isoformat()


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
                    comment
                    createdBy {{ id }}
                    deletedOn
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
        "comment": default_product["comment"],
        "gender": "Women",
        "createdBy": {"id": str(default_product["created_by"])},
        "deletedOn": default_product["deleted_on"],
    }


def test_products_query(read_only_client, base1_products):
    query = """query { products { elements { name } } }"""
    products = assert_successful_request(read_only_client, query)["elements"]
    assert products == [{"name": p["name"]} for p in base1_products]


def _create_mutation(creation_input):
    return f"""mutation {{
                createCustomProduct(creationInput: {creation_input}) {{
                ...on Product {{
                    id
                    name
                    category {{ id }}
                    sizeRange {{ id }}
                    gender
                    base {{ id }}
                    price
                    comment
                    inShop
                    createdBy {{ id }}
                    createdOn
                    lastModifiedBy {{ id }}
                    lastModifiedOn
                    deletedOn
                }} }} }}"""


def test_product_mutations(
    client, default_base, default_product_category, default_size_range
):
    base_id = str(default_base["id"])
    category_id = str(default_product_category["id"])
    size_range_id = str(default_size_range["id"])
    gender = ProductGender.UnisexAdult.name

    # Test case X
    creation_input = f"""{{
            categoryId: {category_id}
            sizeRangeId: {size_range_id}
            gender: {gender}
            baseId: {base_id}
            }}"""
    mutation = _create_mutation(creation_input)
    created_product = assert_successful_request(client, mutation)
    created_product.pop("id")
    assert created_product.pop("createdOn").startswith(today)
    assert created_product == {
        "name": "",
        "category": {"id": category_id},
        "sizeRange": {"id": size_range_id},
        "gender": gender,
        "base": {"id": base_id},
        "price": 0.0,
        "comment": None,
        "inShop": False,
        "createdBy": {"id": "8"},
        "lastModifiedBy": None,
        "lastModifiedOn": None,
        "deletedOn": None,
    }

    # Test case Y
    name = "Sweater"
    price = 12
    comment = "new"
    in_shop = True
    creation_input = f"""{{
            categoryId: {category_id}
            sizeRangeId: {size_range_id}
            gender: {gender}
            baseId: {base_id}
            name: "{name}"
            price: {price}
            comment: "{comment}"
            inShop: {str(in_shop).lower()}
            }}"""
    mutation = _create_mutation(creation_input)
    created_product = assert_successful_request(client, mutation)
    created_product.pop("id")
    assert created_product.pop("createdOn").startswith(today)
    assert created_product == {
        "name": name,
        "category": {"id": category_id},
        "sizeRange": {"id": size_range_id},
        "gender": gender,
        "base": {"id": base_id},
        "price": price,
        "comment": comment,
        "inShop": in_shop,
        "createdBy": {"id": "8"},
        "lastModifiedBy": None,
        "lastModifiedOn": None,
        "deletedOn": None,
    }
