import pytest


@pytest.mark.usefixtures("default_location")
def test_location(client, default_location):
    graph_ql_query_string = f"""query {{
                location(id: "{default_location['id']}") {{
                    name
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_location = response_data.json["data"]["location"]
    assert queried_location["name"] == default_location["name"]


@pytest.mark.usefixtures("default_location")
def test_locations(client, default_location):
    graph_ql_query_string = """query {
                locations {
                    name
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_location = response_data.json["data"]["locations"][0]
    assert queried_location["name"] == default_location["name"]
