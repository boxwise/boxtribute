from auth import mock_user_for_request
from utils import assert_successful_request


def test_user_query(read_only_client, default_user, another_user, default_organisation):
    # Test case 10.1.2
    user_id = another_user["id"]
    query = f"""query {{
                user(id: {user_id}) {{
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
    assert queried_user == {
        "id": str(user_id),
        "name": another_user["name"],
        "email": another_user["email"],
        "validFirstDay": another_user["valid_first_day"].isoformat(),
        "validLastDay": another_user["valid_last_day"].isoformat(),
        "lastLogin": another_user["last_login"].isoformat() + "+00:00",
        "lastAction": another_user["last_action"].isoformat() + "+00:00",
        "bases": [{"id": "1"}],
        "organisation": {"id": str(default_organisation["id"])},
    }

    user_id = default_user["id"]
    query = f"""query {{
                user(id: {user_id}) {{
                    id
                    organisation {{ id }} }} }}"""
    queried_user = assert_successful_request(read_only_client, query)
    assert queried_user == {"id": str(user_id), "organisation": None}


def test_user_query_for_god_user(read_only_client, mocker, god_user):
    user_id = god_user["id"]
    mock_user_for_request(mocker, permissions=["*"], user_id=user_id, base_ids=[])
    query = f"query {{ user (id: {user_id}) {{ organisation {{ id }} }} }}"
    user = assert_successful_request(read_only_client, query)
    assert user == {"organisation": None}


def test_users_query(read_only_client):
    # Test case 10.1.1
    query = """query { users { id name } }"""
    assert assert_successful_request(read_only_client, query) == []
