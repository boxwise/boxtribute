import pytest


@pytest.mark.usefixtures("default_product")
def test_product(client, default_product):
    graph_ql_query_string = f"""query {{
                product(id: {default_product['id']}) {{
                    name
                    price
                    gender
                    sizes
                    category {{
                        hasGender
                    }}
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["product"]
    assert queried_product["name"] == default_product["name"]
    assert queried_product["price"] == default_product["price"]
    assert queried_product["gender"] == "Women"
    assert queried_product["sizes"] == []
    assert queried_product["category"]["hasGender"]


@pytest.mark.usefixtures("default_product")
def test_products(client, default_product):
    graph_ql_query_string = """query {
                products {
                    elements {
                        name
                    }
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["products"]["elements"][0]
    assert queried_product["name"] == default_product["name"]
