from boxwise_flask.db import db
from boxwise_flask.models import Camps


def test_index(client):
    """Verify valid app setup by getting the landing page."""
    rv = client.get("/")
    assert b"This is a landing page" == rv.data


def test_private_endpoint(client):
    """example test for private endpoint"""
    response_data = client.get("/api/private")
    assert response_data.status_code == 200
    assert (
        "Hello from a private endpoint! You need to be authenticated to see this."
        == response_data.json["message"]
    )


def test_graphql_endpoint(client):
    """example test for graphql endpoint"""

    db.connect_db()
    Camps.create(id=1, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=2, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=3, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=4, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=5, organisation_id=1, name="some text1", currencyname="hello")
    db.close_db(None)

    graph_ql_query_string = """query { \
        allBases { \
            id \
            organisation_id \
            name \
        } \
    }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    assert response_data.json["data"]["allBases"][0]["id"] == 1
