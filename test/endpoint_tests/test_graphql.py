from boxwise_flask.db import db
from boxwise_flask.models import Camps, Cms_Users


def test_all_bases(client):
    """Verify allBases GraphQL query endpoint"""

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


def test_base(client):
    """Verify base GraphQL query endpoint"""

    db.connect_db()
    Camps.create(id=1, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=2, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=3, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=4, organisation_id=1, name="some text1", currencyname="hello")
    Camps.create(id=5, organisation_id=1, name="some text1", currencyname="hello")
    db.close_db(None)

    graph_ql_query_string = """query Base {
                base(id: "1") {
                    id
                    organisation_id
                    name
                    currencyname
                }
            }"""
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    assert response_data.json["data"]["base"]["id"] == 1


def test_all_users(client):
    """Verify allUsers GraphQL query endpoint"""

    db.connect_db()
    emails = [
        "mr-anderson@matrix.co.uk",
        "hamburgerman@beef.co.uk",
        "marmalade@jam.co.uk",
    ]
    for i, email in enumerate(emails):

        Cms_Users.create(
            id=i,
            name="",
            email=email,
            cms_usergroups_id="",
            valid_firstday="",
            valid_lastday="",
            lastlogin="",
            lastaction="",
        )

    db.close_db(None)

    graph_ql_query_string = """query { \
                allUsers { \
                    id \
                    name \
                } \
            }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    print(response_data.json)
    assert response_data.status_code == 200
    assert response_data.json["data"]["allUsers"][0]["id"] == 0


def test_user(client):
    """Verify users GraphQL query endpoint"""

    db.connect_db()
    emails = [
        "mr-anderson@matrix.co.uk",
        "hamburgerman@beef.co.uk",
        "marmalade@jam.co.uk",
    ]
    for i, email in enumerate(emails):
        Cms_Users.create(
            id=i,
            name="",
            email=email,
            cms_usergroups_id="",
            valid_firstday="",
            valid_lastday="",
            lastlogin="",
            lastaction="",
        )

    db.close_db(None)
    test_id = 0
    matrix_email = '"%s"' % emails[test_id]
    graph_ql_query_string = (
        """query User {
                user(email: %s) {
                    id \
                    name \
                }
            }"""
        % matrix_email
    )
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    assert response_data.json["data"]["user"]["id"] == test_id
