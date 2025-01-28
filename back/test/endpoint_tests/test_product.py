import enum
from datetime import date

import pytest
from boxtribute_server.enums import BoxState, ProductGender, ProductType
from boxtribute_server.models.definitions.history import DbChangeHistory
from utils import assert_successful_request

today = date.today().isoformat()


def test_product_query(
    read_only_client,
    default_product,
    default_size,
    another_size,
    default_size_range,
    default_boxes,
    disabled_standard_product,
):
    # Test case 8.1.21
    product_id = default_product["id"]
    query = f"""query {{
                product(id: {product_id}) {{
                    id
                    name
                    type
                    category {{ hasGender }}
                    sizeRange {{
                        id
                        name
                        label
                        sizes {{ id name label }}
                    }}
                    base {{ id }}
                    price
                    gender
                    comment
                    instockItemsCount
                    createdBy {{ id }}
                    lastModifiedOn
                    lastModifiedBy {{ id }}
                    deletedOn
                }}
            }}"""
    queried_product = assert_successful_request(read_only_client, query)
    assert queried_product == {
        "id": str(product_id),
        "name": default_product["name"],
        "type": ProductType.Custom.name,
        "category": {"hasGender": True},
        "sizeRange": {
            "id": str(default_product["size_range"]),
            "name": default_size_range["label"],
            "label": default_size_range["label"],
            "sizes": [
                {
                    "id": str(default_size["id"]),
                    "name": default_size["label"],
                    "label": default_size["label"],
                },
                {
                    "id": str(another_size["id"]),
                    "name": another_size["label"],
                    "label": another_size["label"],
                },
            ],
        },
        "base": {"id": str(default_product["base"])},
        "price": default_product["price"],
        "comment": default_product["comment"],
        "instockItemsCount": sum(
            [
                b["number_of_items"]
                for b in default_boxes
                if b["product"] == product_id
                and b["state"] == BoxState.InStock
                and not b["deleted_on"]
            ]
        ),
        "gender": "Women",
        "createdBy": {"id": str(default_product["created_by"])},
        "lastModifiedOn": None,
        "lastModifiedBy": None,
        "deletedOn": default_product["deleted_on"],
    }

    query = f"""query {{
                product(id: {disabled_standard_product["id"]}) {{ instockItemsCount }}
            }}"""
    queried_product = assert_successful_request(read_only_client, query)
    assert queried_product == {"instockItemsCount": 0}


@pytest.mark.parametrize(
    "filter_input,ids",
    [
        # Test case 8.1.26
        ["includeDeleted: true", [1, 3, 4, 5, 6, 8, 9]],
        ["type: Custom", [1, 3, 8, 9]],
        ["type: StandardInstantiation", [5]],
        ["type: All", [1, 3, 5, 8, 9]],
        ["includeDeleted: true, type: StandardInstantiation", [5, 6]],
        ["includeDeleted: true, type: All", [1, 3, 4, 5, 6, 8, 9]],
    ],
)
def test_product_query_filtering(read_only_client, default_base, filter_input, ids):
    base_id = default_base["id"]
    query = f"""query {{ base(id: {base_id}) {{
                    products(filterInput: {{ {filter_input} }}) {{ id }} }} }}"""
    products = assert_successful_request(read_only_client, query)["products"]
    assert products == [{"id": str(i)} for i in ids]


def test_products_query(read_only_client, base1_products):
    # Test case 8.1.20
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
                ...on InvalidPriceError {{ value }}
                ...on EmptyNameError {{ _ }}
                }} }}"""


def test_custom_product_mutations(
    client,
    default_base,
    default_product_category,
    default_size_range,
    product_categories,
    another_size_range,
    default_product,
    default_boxes,
    another_user,
    products,
):
    base_id = str(default_base["id"])
    category_id = str(default_product_category["id"])
    size_range_id = str(default_size_range["id"])
    gender = ProductGender.UnisexAdult.name
    name = "Sweater"
    user_id = str(another_user["id"])

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
        "createdBy": {"id": user_id},
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
        "createdBy": {"id": user_id},
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

    in_shop = True
    mutation = _create_update_mutation("inShop", in_shop)
    response = assert_successful_request(client, mutation)
    assert response == {"inShop": in_shop}

    # Verify update of last_modified_* fields
    query = f"""query {{ product(id: {product_id}) {{
                    lastModifiedOn
                    lastModifiedBy {{ id }}
                }} }}"""
    response = assert_successful_request(client, query)
    assert response.pop("lastModifiedOn").startswith(today)
    assert response == {"lastModifiedBy": {"id": user_id}}

    # Test case 8.2.51
    price = -32
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {product_id}, price: {price} }} ) {{
                        ...on InvalidPriceError {{ value }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"value": price}

    # Test case 8.2.52
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {product_id}, name: "" }} ) {{
                        ...on EmptyNameError {{ _ }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"_": None}

    # Test case 8.2.54
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {products[4]["id"]}, price: 1 }} ) {{
                        ...on ProductTypeMismatchError {{ expectedType }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": ProductType.Custom.name}

    # Test case 8.2.55
    mutation = f"""mutation {{ deleteProduct(id: {product_id}) {{
                    ...on Product {{
                        deletedOn
                        lastModifiedOn
                        lastModifiedBy {{ id }}
                    }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["deletedOn"].startswith(today)
    assert response["lastModifiedOn"].startswith(today)
    assert response["lastModifiedBy"] == {"id": user_id}

    # Test case 8.2.59
    product_with_boxes_id = default_product["id"]
    mutation = f"""mutation {{ deleteProduct(id: {product_with_boxes_id}) {{
                    ...on BoxesStillAssignedToProductError {{ labelIdentifiers }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["labelIdentifiers"] == [
        b["label_identifier"]
        for b in default_boxes[1:-1]
        if b["id"] not in [12, 13, 17]  # test boxes with product IDs 5, 3, and 8
    ]

    # Test case 8.2.59a
    std_product_instantiation_id = products[4]["id"]
    mutation = f"""mutation {{
                deleteProduct(id: {std_product_instantiation_id}) {{
                    ...on ProductTypeMismatchError {{ expectedType }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": ProductType.Custom.name}

    # Test case 8.2.53
    comment = "new"
    mutation = f"""mutation {{ editCustomProduct(
                    editInput: {{ id: {another_product_id}, comment: "{comment}" }} )
                    {{ ...on Product {{
                        lastModifiedOn
                        lastModifiedBy {{ id }}
                    }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"lastModifiedOn": None, "lastModifiedBy": None}

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "products")
        .dicts()
    )
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": "Record created",
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": 'name changed from "Sweater" to "Tops";',
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "category_id",
            "record_id": int(product_id),
            "from_int": 1,
            "to_int": 12,
        },
        {
            "changes": "sizegroup_id",
            "record_id": int(product_id),
            "from_int": 1,
            "to_int": 2,
        },
        {
            "changes": "gender_id",
            "record_id": int(product_id),
            "from_int": 3,
            "to_int": 2,
        },
        {
            "changes": "value",
            "record_id": int(product_id),
            "from_int": 0,
            "to_int": 40,
        },
        {
            "changes": 'comments changed from "None" to "from Germany";',
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "stockincontainer",
            "record_id": int(product_id),
            "from_int": 0,
            "to_int": 1,
        },
        {
            "changes": "Record deleted",
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "Record created",
            "record_id": int(another_product_id),
            "from_int": None,
            "to_int": None,
        },
    ]


def _enable_mutation(enable_input):
    return f"""mutation {{
                enableStandardProduct(enableInput: {enable_input}) {{
                ...on Product {{
                    id
                    name
                    type
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
                ...on InvalidPriceError {{ value }}
                ...on StandardProductAlreadyEnabledForBaseError {{
                    existingStandardProductInstantiationId
                }}
                }} }}"""


def test_standard_product_instantiation_mutations(
    client,
    default_base,
    default_size_range,
    another_size_range,
    default_standard_product,
    another_standard_product,
    another_user,
    products,
    default_boxes,
    default_product,
):
    base_id = str(default_base["id"])
    size_range_id = str(default_size_range["id"])
    standard_product_id = str(another_standard_product["id"])
    user_id = str(another_user["id"])

    # Test case 8.2.60
    enable_input = f"""{{
            standardProductId: {standard_product_id}
            baseId: {base_id}
            }}"""
    mutation = _enable_mutation(enable_input)
    created_product = assert_successful_request(client, mutation)
    product_id = created_product.pop("id")
    assert created_product.pop("createdOn").startswith(today)
    assert created_product == {
        "name": another_standard_product["name"],
        "type": ProductType.StandardInstantiation.name,
        "category": {"id": str(another_standard_product["category"])},
        "sizeRange": {"id": str(another_standard_product["size_range"])},
        "gender": ProductGender(another_standard_product["gender"]).name,
        "base": {"id": base_id},
        "price": 0.0,
        "comment": None,
        "inShop": False,
        "createdBy": {"id": user_id},
        "lastModifiedBy": None,
        "lastModifiedOn": None,
        "deletedOn": None,
    }

    # Test case 8.2.80
    mutation = f"""mutation {{ disableStandardProduct(instantiationId: {product_id}) {{
                    ...on Product {{
                        deletedOn
                        lastModifiedOn
                        lastModifiedBy {{ id }}
                    }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["deletedOn"].startswith(today)
    assert response["lastModifiedOn"] is None
    assert response["lastModifiedBy"] is None

    # Test case 8.2.85
    custom_product_id = str(default_product["id"])
    mutation = f"""mutation {{
                disableStandardProduct(instantiationId: {custom_product_id}) {{
                    ...on ProductTypeMismatchError {{ expectedType }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": ProductType.StandardInstantiation.name}

    # Test case 8.2.61
    price = 12
    comment = "new"
    in_shop = True
    enable_input = f"""{{
            standardProductId: {standard_product_id}
            baseId: {base_id}
            sizeRangeId: {size_range_id}
            price: {price}
            comment: "{comment}"
            inShop: {str(in_shop).lower()}
            }}"""
    mutation = _enable_mutation(enable_input)
    created_product = assert_successful_request(client, mutation)
    another_product_id = created_product.pop("id")
    assert created_product.pop("createdOn").startswith(today)
    assert created_product == {
        "name": another_standard_product["name"],
        "type": ProductType.StandardInstantiation.name,
        "category": {"id": str(another_standard_product["category"])},
        "sizeRange": {"id": size_range_id},
        "gender": ProductGender(another_standard_product["gender"]).name,
        "base": {"id": base_id},
        "price": price,
        "comment": comment,
        "inShop": in_shop,
        "createdBy": {"id": user_id},
        "lastModifiedBy": None,
        "lastModifiedOn": None,
        "deletedOn": None,
    }

    # Test case 8.2.67
    price = -10
    enable_input = f"""{{
            standardProductId: {standard_product_id}
            baseId: {base_id}
            price: {price}
            }}"""
    mutation = _enable_mutation(enable_input)
    response = assert_successful_request(client, mutation)
    assert response == {"value": price}

    # Test case 8.2.68
    standard_product_id = default_standard_product["id"]
    enable_input = f"""{{
            standardProductId: {standard_product_id}
            baseId: {base_id}
            }}"""
    mutation = _enable_mutation(enable_input)
    response = assert_successful_request(client, mutation)
    assert response == {"existingStandardProductInstantiationId": "5"}

    # Test case 8.2.70
    def _create_update_mutation(field, value):
        if isinstance(value, str):
            value = f'"{value}"'
        if isinstance(value, enum.Enum):
            value = value.name
        if isinstance(value, bool):
            value = "true" if value else "false"

        update_input = f"id: {another_product_id}, {field}: {value}"
        if field.endswith("Id"):
            field = f"{field.rstrip('Id')} {{ id }}"
        return f"""mutation {{
                editStandardProductInstantiation(editInput: {{ {update_input} }} ) {{
                    ...on Product {{
                        {field}
                    }} }} }}"""

    size_range_id = another_size_range["id"]
    mutation = _create_update_mutation("sizeRangeId", size_range_id)
    response = assert_successful_request(client, mutation)
    assert response == {"sizeRange": {"id": str(size_range_id)}}

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

    # Verify update of last_modified_* fields
    query = f"""query {{ product(id: {another_product_id}) {{
                    lastModifiedOn
                    lastModifiedBy {{ id }}
                }} }}"""
    response = assert_successful_request(client, query)
    assert response.pop("lastModifiedOn").startswith(today)
    assert response == {"lastModifiedBy": {"id": user_id}}

    # Test case 8.2.75
    price = -32
    mutation = f"""mutation {{ editStandardProductInstantiation(editInput: {{
                    id: {product_id}, price: {price} }} ) {{
                        ...on InvalidPriceError {{ value }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"value": price}

    # Test case 8.2.76
    price = 40
    mutation = _create_update_mutation("price", price)
    response = assert_successful_request(client, mutation)
    assert response == {"price": float(price)}

    # Test case 8.2.77
    mutation = f"""mutation {{ editStandardProductInstantiation(editInput: {{
                    id: {products[0]["id"]}, price: 1 }} ) {{
                        ...on ProductTypeMismatchError {{ expectedType }} }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"expectedType": ProductType.StandardInstantiation.name}

    # Test case 8.2.84
    product_with_boxes_id = products[4]["id"]
    mutation = f"""mutation {{
                disableStandardProduct(instantiationId: {product_with_boxes_id}) {{
                    ...on BoxesStillAssignedToProductError {{ labelIdentifiers }}
                }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["labelIdentifiers"] == [default_boxes[9]["label_identifier"]]

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "products")
        .dicts()
    )
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": "Record created",
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "Record deleted",
            "record_id": int(product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "Record created",
            "record_id": int(another_product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "sizegroup_id",
            "record_id": int(another_product_id),
            "from_int": 1,
            "to_int": 2,
        },
        {
            "changes": "value",
            "record_id": int(another_product_id),
            "from_int": 12,
            "to_int": 40,
        },
        {
            "changes": 'comments changed from "new" to "from Germany";',
            "record_id": int(another_product_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "stockincontainer",
            "record_id": int(another_product_id),
            "from_int": 1,
            "to_int": 0,
        },
    ]
