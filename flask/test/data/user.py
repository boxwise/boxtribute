from datetime import date, datetime

import pytest
from boxwise_flask.models.user import User
from data.usergroup import default_usergroup_data

TIME = datetime.now()
TODAY = date.today()


def default_user_data():
    mock_user = {
        "id": 1,
        "name": "a",
        "email": "a@b.com",
        "valid_first_day": TODAY,
        "valid_last_day": TODAY,
        "last_login": TIME,
        "last_action": TIME,
        "is_admin": 0,
        "created": TIME,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "language": None,
        "deleted": None,
        "usergroup": default_usergroup_data()["id"],
    }

    return mock_user


def default_users_data():
    users = {}

    mock_user = default_user_data()

    users[mock_user["id"]] = mock_user

    mock_user = {
        "id": 2,
        "name": "trainer",
        "email": "alarm@bedpost.com",
        "valid_first_day": TODAY,
        "valid_last_day": TODAY,
        "last_login": TIME,
        "last_action": TIME,
        "is_admin": 0,
        "created": TIME,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    users[mock_user["id"]] = mock_user

    mock_user = {
        "id": 8,
        "name": "coord",
        "email": "dev_coordinator@boxaid.org",
        "valid_first_day": TODAY,
        "valid_last_day": TODAY,
        "last_login": TIME,
        "last_action": TIME,
        "is_admin": 0,
        "created": TIME,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "language": None,
        "deleted": None,
        "usergroup": default_usergroup_data()["id"],
    }

    users[mock_user["id"]] = mock_user

    return users


@pytest.fixture()
def default_user():
    return default_user_data()


@pytest.fixture()
def default_users():
    return default_users_data()


def create_default_users():
    User.insert_many(default_users_data().values()).execute()
