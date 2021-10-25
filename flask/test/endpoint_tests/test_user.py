import pytest


def get_user_from_list_of_dicts(id, list_of_dicts):
    return [x for x in list_of_dicts if x["id"] == id][0]


@pytest.mark.usefixtures("default_users")
@pytest.mark.usefixtures("default_organisation")
def test_user_query_from_email(client, default_users, default_organisation):
    test_id = 8
    expected_user = default_users[test_id]

    graph_ql_query_string = f"""query User {{
                user(id: {test_id}) {{
                    id
                    name
                    email
                    validFirstDay
                    validLastDay
                    bases {{
                        id
                        name
                    }}
                    organisation {{
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
    assert [int(b["id"]) for b in queried_user["bases"]] == [1]
    assert queried_user["bases"][0]["name"] == "the best name"
    assert int(queried_user["organisation"]["id"]) == default_organisation["id"]


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
