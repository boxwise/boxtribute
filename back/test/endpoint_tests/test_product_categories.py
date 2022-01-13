from utils import assert_successful_request


def test_product_categories_query(read_only_client):
    query = """query {
                productCategories {
                    name
                    products {
                        elements {
                            id
                        }
                    }
                    sizeRanges {
                        id
                    }
                    hasGender
                }
            }"""
    queried_categories = assert_successful_request(read_only_client, query)
    assert len(queried_categories) == 4
    assert len([c for c in queried_categories if c["hasGender"]]) == 1
