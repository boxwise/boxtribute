import pytest


@pytest.mark.usefixtures("default_organisation")
def test_organisation(client, default_organisation):
    graph_ql_query_string = f"""query {{
                organisation(id: "{default_organisation['id']}") {{
                    name
                }}
            }}"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_organisation = response_data.json["data"]["organisation"]
    assert queried_organisation["name"] == default_organisation["name"]


@pytest.mark.usefixtures("default_organisation")
def test_organisations(client, default_organisation):
    graph_ql_query_string = """query {
                organisations {
                    name
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_organisation = response_data.json["data"]["organisations"][0]
    assert queried_organisation["name"] == default_organisation["name"]


def test_unauthorized_organisation(client):
    graph_ql_query_string = """query {
                organisation(id: 0) {
                    name
                }
            }"""

    data = {"query": graph_ql_query_string}
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
