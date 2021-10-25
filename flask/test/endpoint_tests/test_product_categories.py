import pytest


@pytest.mark.usefixtures("default_product_category")
def test_product_categorys(client, default_product_category):
    graph_ql_query_string = """query {
                productCategories {
                    name
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_categories = response_data.json["data"]["productCategories"]
    assert len(queried_categories) == 1
    assert queried_categories[0]["name"] == default_product_category["name"]
