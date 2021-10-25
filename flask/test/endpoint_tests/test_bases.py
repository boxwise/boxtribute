import pytest


def get_base_from_graphql(id, base_query):
    return [x for x in base_query if int(x["id"]) == id][0]


@pytest.mark.usefixtures("default_bases")
def test_all_bases(client, default_bases):
    graph_ql_query_string = """query {
                bases {
                    id
                    name
                    currencyName
                }
            }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)

    assert response_data.status_code == 200
    all_bases = response_data.json["data"]["bases"]
    assert len(all_bases) == 1

    queried_base = all_bases[0]
    queried_base_id = int(queried_base["id"])
    expected_base = default_bases[queried_base_id]

    assert queried_base_id == expected_base["id"]
    assert queried_base["name"] == expected_base["name"]
    assert queried_base["currencyName"] == expected_base["currency_name"]


@pytest.mark.usefixtures("default_bases")
def test_base(client, default_bases):
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
    assert int(created_base["id"]) == expected_base["id"]
    assert created_base["name"] == expected_base["name"]
    assert created_base["currencyName"] == expected_base["currency_name"]


def test_invalid_permission_for_organisation_bases(
    unauthorized_client, default_organisation
):
    # verify missing base:read permission
    org_id = default_organisation["id"]
    data = {
        "query": f"""query {{ organisation(id: "{org_id}") {{ bases {{ id }} }} }}"""
    }
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["organisation"] == {"bases": None}
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
