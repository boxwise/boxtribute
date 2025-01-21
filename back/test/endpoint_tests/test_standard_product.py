from datetime import date

from auth import mock_user_for_request
from boxtribute_server.enums import ProductGender
from utils import assert_successful_request

today = date.today().isoformat()


def test_standard_product_query(
    read_only_client,
    default_standard_product,
    another_standard_product,
    measure_standard_product,
    mass_units,
    mocker,
):
    # Test case 8.1.41
    query = f"""query {{
                standardProduct(id: {default_standard_product['id']}) {{
                ... on StandardProduct {{
                    id
                    name
                    category {{ id }}
                    sizeRange {{ id }}
                    gender
                    version
                    instantiation {{ id }}
                    enabledForBases {{ id }}
                    addedBy {{ id }}
                    deprecatedBy {{ id }}
                    deprecatedOn
                }} }} }}"""
    product = assert_successful_request(read_only_client, query)
    assert product == {
        "id": str(default_standard_product["id"]),
        "name": default_standard_product["name"],
        "category": {"id": str(default_standard_product["category"])},
        "gender": ProductGender(default_standard_product["gender"]).name,
        "sizeRange": {"id": str(default_standard_product["size_range"])},
        "version": default_standard_product["version"],
        "enabledForBases": [{"id": "1"}],
        "instantiation": None,
        "addedBy": {"id": str(default_standard_product["added_by"])},
        "deprecatedBy": None,
        "deprecatedOn": None,
    }
    query = f"""query {{
                standardProduct(id: {measure_standard_product['id']}) {{
                ... on StandardProduct {{
                    sizeRange {{
                        sizes {{ id }}
                        units {{ id }}
                    }}
                    gender
                }} }} }}"""
    product = assert_successful_request(read_only_client, query)
    assert product == {
        "gender": ProductGender(measure_standard_product["gender"]).name,
        "sizeRange": {
            "sizes": [],
            "units": [{"id": str(u["id"])} for u in mass_units],
        },
    }
    query = f"""query {{
                standardProduct(id: {another_standard_product['id']}) {{
                ... on StandardProduct {{
                    enabledForBases {{ id }}
                    instantiation {{ id }}
                }} }} }}"""
    product = assert_successful_request(read_only_client, query)
    assert product == {"enabledForBases": [], "instantiation": None}

    mock_user_for_request(mocker, is_god=True)
    query = f"""query {{
                standardProduct(id: {default_standard_product['id']}) {{
                ... on StandardProduct {{
                    enabledForBases {{ id }}
                    instantiation {{ id }}
                }} }} }}"""
    product = assert_successful_request(read_only_client, query)
    assert product == {
        "enabledForBases": [{"id": "1"}, {"id": "3"}],
        "instantiation": None,
    }


def test_standard_products_query(
    read_only_client,
    default_standard_product,
    newest_standard_product,
    products,
    mocker,
):
    # Test case 8.1.40
    query = """query { standardProducts {
                ...on StandardProductPage { elements {
                    name
                    instantiation { id }
                } } } }"""
    std_products = assert_successful_request(read_only_client, query)["elements"]
    assert std_products == [
        {"name": str(newest_standard_product["name"]), "instantiation": None}
    ]

    # Test case 8.1.45
    query = """query { standardProducts( baseId: 1 ) {
                ...on StandardProductPage { elements {
                    id
                    instantiation { id }
                } } } }"""
    std_products = assert_successful_request(read_only_client, query)["elements"]
    assert std_products == [
        {
            "id": str(default_standard_product["id"]),
            "instantiation": {"id": str(products[4]["id"])},
        },
        {"id": str(newest_standard_product["id"]), "instantiation": None},
    ]

    mock_user_for_request(mocker, base_ids=[2])
    query = """query { standardProducts( baseId: 2 ) {
                ...on StandardProductPage { elements {
                    id
                    instantiation { id }
                } } } }"""
    std_products = assert_successful_request(read_only_client, query)["elements"]
    assert std_products == [
        {"id": str(newest_standard_product["id"]), "instantiation": None}
    ]
