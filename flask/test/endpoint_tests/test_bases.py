import pytest


def get_base_from_graphql(id, base_query):
    return [x for x in base_query if x["id"] == id][0]


@pytest.mark.usefixtures("default_bases")
def test_all_bases(client, default_bases):
    """Verify allBases GraphQL query endpoint"""
    graph_ql_query_string = """query {
                allBases {
                    id
                    name
                    currencyName
                }
            }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)

    assert response_data.status_code == 200
    all_bases = response_data.json["data"]["allBases"]
    for _, expected_base in default_bases.items():
        created_base = get_base_from_graphql(expected_base["id"], all_bases)
        assert created_base["id"] == expected_base["id"]
        assert created_base["name"] == expected_base["name"]
        assert created_base["currencyName"] == expected_base["currency_name"]


@pytest.mark.usefixtures("default_bases")
def test_base(client, default_bases):
    """Verify base GraphQL query endpoint"""

    test_id = 1
    graph_ql_query_string = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    currencyName
                }}
            }}"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200

    expected_base = default_bases[test_id]
    created_base = response_data.json["data"]["base"]
    assert created_base["id"] == expected_base["id"]
    assert created_base["name"] == expected_base["name"]
    assert created_base["currencyName"] == expected_base["currency_name"]
