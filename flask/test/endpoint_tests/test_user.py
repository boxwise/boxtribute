import pytest


def get_user_from_list_of_dicts(id, list_of_dicts):
    return [x for x in list_of_dicts if x["id"] == id][0]


@pytest.mark.usefixtures("default_users")
def test_user_query_from_email(client, default_users):
    test_id = list(default_users.keys())[0]
    expected_user = default_users[test_id]
    user_email = expected_user["email"]

    graph_ql_query_string = f"""query User {{
                user(email: "{user_email}") {{
                    id
                    name
                    email
                    validFirstDay
                    validLastDay
                    bases {{
                        id
                    }}
                    lastLogin
                    lastAction
                }}
            }}"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)
    queried_user = response_data.json["data"]["user"]
    assert response_data.status_code == 200
    assert int(queried_user["id"]) == test_id
    assert queried_user["validFirstDay"] == expected_user["valid_first_day"].isoformat()
    assert queried_user["lastLogin"] == expected_user["last_login"].isoformat()
    assert [int(b["id"]) for b in queried_user["bases"]] == [1, 2, 3]


@pytest.mark.usefixtures("default_users")
def test_users(client, default_users):
    graph_ql_query_string = """query {
                users {
                    id
                    name
                }
        }"""

    data = {"query": graph_ql_query_string}
    response_data = client.post("/graphql", json=data)

    assert response_data.status_code == 200
    queried_user = response_data.json["data"]["users"][0]

    first_id = int(queried_user["id"])
    assert queried_user["name"] == default_users[first_id]["name"]
