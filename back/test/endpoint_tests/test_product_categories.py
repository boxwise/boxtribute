def test_product_categories(client):
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
                }
            }"""
    data = {"query": query}
    response_data = client.post("/graphql", json=data)
    queried_categories = response_data.json["data"]["productCategories"]
    assert len(queried_categories) == 4
