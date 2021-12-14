def test_product(client, default_product):
    query = f"""query {{
                product(id: {default_product['id']}) {{
                    id
                    name
                    category {{
                        hasGender
                    }}
                    sizeRange {{
                        id
                    }}
                    sizes
                    base {{
                        id
                    }}
                    price
                    gender
                    createdBy {{
                        id
                    }}
                }}
            }}"""
    data = {"query": query}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["product"]
    assert queried_product == {
        "id": str(default_product["id"]),
        "name": default_product["name"],
        "category": {"hasGender": True},
        "sizeRange": {"id": str(default_product["size_range"])},
        "sizes": [],
        "base": {"id": str(default_product["base"])},
        "price": default_product["price"],
        "gender": "Women",
        "createdBy": {"id": str(default_product["created_by"])},
    }

    query = """query {
                products {
                    elements {
                        name
                    }
                }
            }"""
    data = {"query": query}
    response_data = client.post("/graphql", json=data)
    queried_product = response_data.json["data"]["products"]["elements"][0]
    assert queried_product["name"] == default_product["name"]
