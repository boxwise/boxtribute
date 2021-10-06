import pytest


@pytest.mark.usefixtures("default_location")
def test_location(client, default_location):
    graph_ql_query_string = f"""query {{
                location(id: "{default_location['id']}") {{
                    name
                    boxState
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_location = response_data.json["data"]["location"]
    assert queried_location["name"] == default_location["name"]
    assert queried_location["boxState"] == "InStock"


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


def test_unauthorized_location(client):
    graph_ql_query_string = """query {
                location(id: "0") {
                    name
                }
            }"""

    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
