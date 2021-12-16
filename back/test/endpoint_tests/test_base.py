def test_bases_query(read_only_client, default_bases):
    query = """query {
                bases {
                    id
                    name
                    currencyName
                }
            }"""

    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)

    assert response_data.status_code == 200
    all_bases = response_data.json["data"]["bases"]
    assert len(all_bases) == 1

    queried_base = all_bases[0]
    queried_base_id = int(queried_base["id"])
    expected_base = default_bases[queried_base_id]

    assert queried_base_id == expected_base["id"]
    assert queried_base["name"] == expected_base["name"]
    assert queried_base["currencyName"] == expected_base["currency_name"]


def test_base_query(read_only_client, default_location, default_bases):
    test_id = 1
    query = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    organisation {{
                        id
                    }}
                    currencyName
                    locations {{
                        id
                    }}
                }}
            }}"""

    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    assert response_data.status_code == 200

    expected_base = default_bases[test_id]
    base = response_data.json["data"]["base"]
    assert int(base["id"]) == expected_base["id"]
    assert base["name"] == expected_base["name"]
    assert base["currencyName"] == expected_base["currency_name"]
    assert int(base["organisation"]["id"]) == expected_base["organisation"]

    locations = base["locations"]
    assert len(locations) == 1
    assert int(locations[0]["id"]) == default_location["id"]
