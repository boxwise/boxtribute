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


def test_invalid_permission(unauthorized_client):
    data = {"query": "query { productCategories { id } }"}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"

    data = {"query": "query { productCategory(id: 3) { name } }"}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["productCategory"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
