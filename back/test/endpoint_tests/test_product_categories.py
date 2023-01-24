from utils import assert_successful_request


def test_product_category_query(read_only_client, default_product_category):
    # Test case 99.1.11
    category_id = str(default_product_category["id"])
    query = f"""query {{ productCategory(id: {category_id}) {{
                id
                name
                sizeRanges {{ id }}
                hasGender
            }} }}"""
    category = assert_successful_request(read_only_client, query)
    assert category == {
        "id": category_id,
        "name": default_product_category["name"],
        "sizeRanges": None,
        "hasGender": True,
    }


def test_product_categories_query(read_only_client):
    # Test case 99.1.10
    query = """query {
                productCategories {
                    name
                    products {
                        elements { id }
                    }
                    sizeRanges { id }
                    hasGender
                }
            }"""
    queried_categories = assert_successful_request(read_only_client, query)
    assert len(queried_categories) == 5
    assert len([c for c in queried_categories if c["hasGender"]]) == 2
