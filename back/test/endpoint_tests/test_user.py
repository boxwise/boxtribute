from utils import assert_successful_request


def test_user_query(read_only_client, another_user, default_organisation):
    # Test case 10.1.2
    test_id = another_user["id"]
    query = f"""query User {{
                user(id: {test_id}) {{
                    id
                    name
                    email
                    validFirstDay
                    validLastDay
                    bases {{ id }}
                    organisation {{ id }}
                    lastLogin
                    lastAction
                }}
            }}"""

    queried_user = assert_successful_request(read_only_client, query)
    assert int(queried_user["id"]) == test_id
    assert queried_user["name"] == another_user["name"]
    assert queried_user["email"] == another_user["email"]
    assert queried_user["validFirstDay"] == another_user["valid_first_day"].isoformat()
    assert queried_user["lastLogin"][:-6] == another_user["last_login"].isoformat()
    assert [int(b["id"]) for b in queried_user["bases"]] == [1]
    assert int(queried_user["organisation"]["id"]) == default_organisation["id"]


def test_users_query(read_only_client):
    # Test case 10.1.1
    query = """query { users { id name } }"""
    assert assert_successful_request(read_only_client, query) == []
