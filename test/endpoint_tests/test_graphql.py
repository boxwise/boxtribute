from boxwise_flask.db import db
from boxwise_flask.models.base import Base
from boxwise_flask.models.user import User


def get_base_from_graphql(id, base_query):
    return [x for x in base_query if x["id"] == id][0]


def test_all_bases(client):
    """Verify allBases GraphQL query endpoint"""
    bases = [
        {"id": 1, "name": "oak-tree", "organisation_id": 1, "currency_name": "pound"},
        {"id": 2, "name": "chicken", "organisation_id": 1, "currency_name": "peanuts"},
        {"id": 3, "name": "sofa", "organisation_id": 1, "currency_name": "candles"},
    ]

    db.connect_db()

    for base in bases:
        Base.create(**base)

    db.close_db(None)

    graph_ql_query_string = """query {
                allBases {
                    id
                    organisationId
                    name
                    currencyName
                }
            }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    all_bases = response_data.json["data"]["allBases"]
    for expected_base in bases:
        created_base = get_base_from_graphql(expected_base["id"], all_bases)
        assert created_base["id"] == expected_base["id"]
        assert created_base["organisationId"] == expected_base["organisation_id"]
        assert created_base["name"] == expected_base["name"]
        assert created_base["currencyName"] == expected_base["currency_name"]


def test_base(client):
    """Verify base GraphQL query endpoint"""
    bases = [
        {"id": 1, "name": "oak-tree", "organisation_id": 1, "currency_name": "pound"},
        {"id": 2, "name": "chicken", "organisation_id": 1, "currency_name": "peanuts"},
        {"id": 3, "name": "sofa", "organisation_id": 1, "currency_name": "candles"},
    ]

    db.connect_db()

    for base in bases:
        Base.create(**base)

    db.close_db(None)
    test_id = 1
    graph_ql_query_string = f"""query Base {{
                base(id: "{test_id}") {{
                    id
                    organisationId
                    name
                    currencyName
                }}
            }}"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    expected_base = get_base_from_graphql(test_id, bases)
    created_base = response_data.json["data"]["base"]
    assert created_base["id"] == expected_base["id"]
    assert created_base["organisationId"] == expected_base["organisation_id"]
    assert created_base["name"] == expected_base["name"]
    assert created_base["currencyName"] == expected_base["currency_name"]


def test_all_users(client):
    """Verify allUsers GraphQL query endpoint"""

    db.connect_db()
    emails = [
        "mr-anderson@matrix.co.uk",
        "hamburgerman@beef.co.uk",
        "marmalade@jam.co.uk",
    ]
    for i, email in enumerate(emails):

        User.create(
            id=i,
            name="",
            email=email,
            usergroup_id="",
            valid_firstday="",
            valid_lastday="",
            lastlogin="",
            lastaction="",
        )

    db.close_db(None)

    graph_ql_query_string = """query {
                allUsers {
                    id
                    name
                }
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
        User.create(
            id=i,
            name="",
            email=email,
            usergroup_id="",
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
                    id
                    name
                }
            }"""
        % matrix_email
    )
    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200
    assert response_data.json["data"]["user"]["id"] == test_id
