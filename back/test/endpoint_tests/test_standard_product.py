from datetime import date

from auth import mock_user_for_request
from boxtribute_server.enums import ProductGender
from utils import assert_successful_request

today = date.today().isoformat()


def test_standard_product_query(
    read_only_client, default_standard_product, another_standard_product
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
        "addedBy": {"id": str(default_standard_product["added_by"])},
        "deprecatedBy": None,
        "deprecatedOn": None,
    }

    query = f"""query {{
                standardProduct(id: {another_standard_product['id']}) {{
                ... on StandardProduct {{
                    enabledForBases {{ id }}
                }} }} }}"""
    product = assert_successful_request(read_only_client, query)
    assert product == {"enabledForBases": []}


def test_standard_products_query(
    read_only_client, default_standard_product, newest_standard_product, mocker
):
    # Test case 8.1.40
    query = """query { standardProducts {
                ...on StandardProductPage { elements { name } } } }"""
    products = assert_successful_request(read_only_client, query)["elements"]
    assert products == [{"name": str(newest_standard_product["name"])}]

    # Test case 8.1.45
    query = """query { standardProducts( baseId: 1 ) {
                ...on StandardProductPage { elements { id } } } }"""
    products = assert_successful_request(read_only_client, query)["elements"]
    assert products == [
        {"id": str(sp["id"])}
        for sp in [newest_standard_product, default_standard_product]
    ]

    mock_user_for_request(mocker, base_ids=[2])
    query = """query { standardProducts( baseId: 2 ) {
                ...on StandardProductPage { elements { id } } } }"""
    products = assert_successful_request(read_only_client, query)["elements"]
    assert products == [{"id": str(newest_standard_product["id"])}]
