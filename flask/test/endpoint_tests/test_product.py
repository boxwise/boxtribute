import pytest


@pytest.mark.usefixtures("default_product")
def test_product(client, default_product):
    graph_ql_query_string = f"""query {{
                product(id: {default_product['id']}) {{
                    name
                    price
                    gender
                    sizes
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["product"]
    assert queried_product["name"] == default_product["name"]
    assert queried_product["price"] == default_product["price"]
    assert queried_product["gender"] == "Women"
    assert queried_product["sizes"] == []


@pytest.mark.usefixtures("default_product")
def test_products(client, default_product):
    graph_ql_query_string = """query {
                products {
                    name
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["products"][0]
    assert queried_product["name"] == default_product["name"]


def test_invalid_permission(unauthorized_client):
    data = {"query": "query { products { id } }"}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"

    data = {"query": "query { product(id: 3) { name } }"}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["product"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
