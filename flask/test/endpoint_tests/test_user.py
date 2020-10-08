from datetime import date, datetime

from boxwise_flask.db import db
from boxwise_flask.models.user import User


def test_user_query_from_email(client):
    """Verify users GraphQL query endpoint"""

    db.connect_db()
    emails = [
        "mr-anderson@matrix.co.uk",
        "hamburgerman@beef.co.uk",
        "marmalade@jam.co.uk",
    ]

    user = {
        "name": "a",
        "email": "a@b.com",
        "valid_firstday": date.today(),
        "valid_lastday": date.today(),
        "lastlogin": datetime.now(),
        "lastaction": datetime.now(),
        "pass_": "pass",
        "is_admin": 0,
        "created": datetime.now(),
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "resetpassword": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    for i in range(len(emails)):
        new_user = user
        new_user["id"] = i
        new_user["email"] = emails[i]
        User.create(**new_user)

    db.close_db(None)
    test_id = 0
    matrix_email = '"%s"' % emails[test_id]
    graph_ql_query_string = f"""query User {{
                user(email: {matrix_email}) {{
                    id
                    organisation_id
                    name
                    email
                    usergroup_id
                    valid_firstday
                    valid_lastday
                    base_id
                    lastlogin
                    lastaction
                }}
            }}"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    assert response_data.status_code == 200

    print(response_data.json["data"])
    print(response_data.json["data"])
    print(response_data.json["data"])
    print(response_data.json["data"])
    print(response_data.json["data"])
    assert response_data.json["data"]["user"]["id"] == test_id


# def test_all_users(client):
#     """Verify allUsers GraphQL query endpoint"""

#     db.connect_db()
#     emails = [
#         "mr-anderson@matrix.co.uk",
#         "hamburgerman@beef.co.uk",
#         "marmalade@jam.co.uk",
#     ]

#     for i, email in enumerate(emails):

#         User.create(
#             id=i,
#             name="",
#             email=email,
#             usergroup_id="",
#             valid_firstday="",
#             valid_lastday="",
#             lastlogin="",
#             lastaction="",
#         )

#     db.close_db(None)

#     graph_ql_query_string = """query {
#                 allUsers {
#                     id
#                     name
#                 }
#         }"""

#     data = {"query": graph_ql_query_string}
#     response_data = client.post("/graphql", json=data)
#     print(response_data.json)
#     assert response_data.status_code == 200
#     assert response_data.json["data"]["allUsers"][0]["id"] == 0
