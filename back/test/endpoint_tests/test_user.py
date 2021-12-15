def test_user(read_only_client, default_users, default_organisation):
    test_id = 8
    expected_user = default_users[test_id]

    query = f"""query User {{
                user(id: {test_id}) {{
                    id
                    name
                    email
                    validFirstDay
                    validLastDay
                    bases {{
                        id
                    }}
                    organisation {{
                        id
                    }}
                    lastLogin
                    lastAction
                }}
            }}"""

    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)
    queried_user = response_data.json["data"]["user"]
    assert response_data.status_code == 200
    assert int(queried_user["id"]) == test_id
    assert queried_user["name"] == expected_user["name"]
    assert queried_user["email"] == expected_user["email"]
    assert queried_user["validFirstDay"] == expected_user["valid_first_day"].isoformat()
    assert queried_user["lastLogin"][:-6] == expected_user["last_login"].isoformat()
    assert [int(b["id"]) for b in queried_user["bases"]] == [1]
    assert int(queried_user["organisation"]["id"]) == default_organisation["id"]

    query = """query {
                users {
                    id
                    name
                }
        }"""

    data = {"query": query}
    response_data = read_only_client.post("/graphql", json=data)

    assert response_data.status_code == 200
    queried_user = response_data.json["data"]["users"][0]

    first_id = int(queried_user["id"])
    assert queried_user["name"] == default_users[first_id]["name"]
