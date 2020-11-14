import pytest


def get_user_from_list_of_dicts(id, list_of_dicts):
    return [x for x in list_of_dicts if x["id"] == id][0]


@pytest.mark.usefixtures("default_users")
def test_user_query_from_email(client, default_users):
    """Verify users GraphQL query endpoint"""
    test_id = list(default_users.keys())[0]
    user_email = '"%s"' % default_users[test_id]["email"]
    graph_ql_query_string = f"""query User {{
                user(email: {user_email}) {{
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
    assert response_data.json["data"]["user"]["id"] == test_id


@pytest.mark.usefixtures("default_users")
def test_all_users(client, default_users):
    """Verify allUsers GraphQL query endpoint"""

    graph_ql_query_string = """query {
                allUsers {
                    id
                    name
                }
        }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)

    assert response_data.status_code == 200
    queried_user = response_data.json["data"]["allUsers"][0]

    first_id = queried_user["id"]
    assert queried_user["name"] == default_users[first_id]["name"]
