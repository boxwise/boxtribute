import enum
from datetime import date

import pytest
from boxtribute_server.enums import ProductGender
from boxtribute_server.models.definitions.history import DbChangeHistory
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


@pytest.mark.parametrize(
    "filter_input,ids",
    [
        # Test case 8.1.26
        ["includeDeleted: true", [1, 3, 4]],
        ["type: Custom", [1, 3]],
        ["type: All", [1, 3]],
    ],
)
def test_product_query_filtering(read_only_client, default_base, filter_input, ids):
    base_id = default_base["id"]
    query = f"""query {{ base(id: {base_id}) {{
                    products(filterInput: {{ {filter_input} }}) {{ id }} }} }}"""
    products = assert_successful_request(read_only_client, query)["products"]
    assert products == [{"id": str(i)} for i in ids]


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
                }}
                ...on InvalidPrice {{ value }}
                ...on EmptyName {{ _ }}
                }} }}"""


def test_product_mutations(
    client,
    default_base,
    default_product_category,
    default_size_range,
    product_categories,
    another_size_range,
):
    base_id = str(default_base["id"])
    category_id = str(default_product_category["id"])
    size_range_id = str(default_size_range["id"])
    gender = ProductGender.UnisexAdult.name
    name = "Sweater"

    # Test case 8.2.34
    creation_input = f"""{{
            categoryId: {category_id}
            sizeRangeId: {size_range_id}
            gender: {gender}
            baseId: {base_id}
            name: "{name}"
            }}"""
    mutation = _create_mutation(creation_input)
    created_product = assert_successful_request(client, mutation)
    product_id = created_product.pop("id")
    assert created_product.pop("createdOn").startswith(today)
    assert created_product == {
        "name": name,
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

    # Test case 8.2.35
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
    another_product_id = created_product.pop("id")
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

    # Test case 8.2.41
    price = -10
    creation_input = f"""{{
            categoryId: {category_id}
            sizeRangeId: {size_range_id}
            gender: {gender}
            baseId: {base_id}
            name: "{name}"
            price: {price}
            }}"""
    mutation = _create_mutation(creation_input)
    response = assert_successful_request(client, mutation)
    assert response == {"value": price}

    # Test case 8.2.42
    creation_input = f"""{{
            categoryId: {category_id}
            sizeRangeId: {size_range_id}
            gender: {gender}
            baseId: {base_id}
            name: ""
            }}"""
    mutation = _create_mutation(creation_input)
    response = assert_successful_request(client, mutation)
    assert response == {"_": None}

    # Test case 8.2.45
    def _create_update_mutation(field, value):
        if isinstance(value, str):
            value = f'"{value}"'
        if isinstance(value, enum.Enum):
            value = value.name
        if isinstance(value, bool):
            value = "true" if value else "false"

        update_input = f"id: {product_id}, {field}: {value}"
        if field.endswith("Id"):
            field = f"{field.rstrip('Id')} {{ id }}"
        return f"""mutation {{
                editCustomProduct(editInput: {{ {update_input} }} ) {{
                    ...on Product {{
                        {field}
                    }} }} }}"""

    name = "Tops"
    mutation = _create_update_mutation("name", name)
    response = assert_successful_request(client, mutation)
    assert response == {"name": name}

    category_id = product_categories[0]["id"]
    mutation = _create_update_mutation("categoryId", category_id)
    response = assert_successful_request(client, mutation)
    assert response == {"category": {"id": str(category_id)}}

    size_range_id = another_size_range["id"]
    mutation = _create_update_mutation("sizeRangeId", size_range_id)
    response = assert_successful_request(client, mutation)
    assert response == {"sizeRange": {"id": str(size_range_id)}}

    gender = ProductGender.Men
    mutation = _create_update_mutation("gender", gender)
    response = assert_successful_request(client, mutation)
    assert response == {"gender": gender.name}

    price = 40
    mutation = _create_update_mutation("price", price)
    response = assert_successful_request(client, mutation)
    assert response == {"price": float(price)}

    comment = "from Germany"
    mutation = _create_update_mutation("comment", comment)
    response = assert_successful_request(client, mutation)
    assert response == {"comment": comment}

    in_shop = False
    mutation = _create_update_mutation("inShop", in_shop)
    response = assert_successful_request(client, mutation)
    assert response == {"inShop": in_shop}

    # Test case 8.1.51
    price = -32
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {product_id}, price: {price} }} ) {{
                        ...on InvalidPrice {{ value }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"value": price}

    # Test case 8.1.52
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {product_id}, name: "" }} ) {{
                        ...on EmptyName {{ _ }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"_": None}

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
        )
        .where(DbChangeHistory.table_name == "products")
        .dicts()
    )
    assert history_entries[0].pop("change_date").isoformat().startswith(today)
    assert history_entries[1].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": "Record created",
            "record_id": int(product_id),
        },
        {
            "changes": "Record created",
            "record_id": int(another_product_id),
        },
    ]
