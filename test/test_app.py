import json
from test.auth_for_testing import get_user_token_header
from test.database_for_testing import with_test_db

import pytest

from boxwise_flask.app import db
from boxwise_flask.models import Camps, Cms_Usergroups_Camps, Cms_Users, Person
from boxwise_flask.routes import app

MODELS = (Person, Camps, Cms_Usergroups_Camps, Cms_Users)


@pytest.fixture
def client():
    """test client to setup app"""
    app.config["DATABASE"] = "sqlite:///:memory:"

    with app.test_client() as client:
        yield client

    db.init_app(app)


def test_index(client):
    """Verify valid app setup by getting the landing page."""
    rv = client.get("/")
    assert b"This is a landing page" == rv.data


def test_private_endpoint(client):
    """example test for private endpoint"""
    token = get_user_token_header()
    rv = client.get("/api/private", headers=token)
    response_data = json.loads(rv.data)
    assert (
        "Hello from a private endpoint! You need to be authenticated to see this."
        == response_data["message"]
    )


@with_test_db(MODELS)
def test_graphql_endpoint(client):
    """example test for graphql endpoint"""
    token = get_user_token_header()

    Camps.create(id=1, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=2, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=3, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=4, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=5, organisation_id=1, name="some text1", currencyname="hello")

    graph_ql_query_string = """query { \
        allBases { \
            id \
            organisation_id \
            name \
        } \
    }"""

    data = {"query": graph_ql_query_string}

    rv = client.post("/graphql", headers=token, json=data)
    response_data = json.loads(rv.data)
    print(response_data)
    assert 1 == 2
