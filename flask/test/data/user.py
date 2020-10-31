from datetime import date, datetime

import pytest
from boxwise_flask.models.user import User

TIME = datetime.now()
TODAY = date.today()


def default_user_data():
    mock_user = {
        "id": 1,
        "name": "a",
        "email": "a@b.com",
        "valid_firstday": TODAY,
        "valid_lastday": TODAY,
        "lastlogin": TIME,
        "lastaction": TIME,
        "pass_": "pass",
        "is_admin": 0,
        "created": TIME,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "resetpassword": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    return mock_user


def default_users_data():
    users_dict = {}

    mock_user = default_user_data()

    users_dict[mock_user["id"]] = mock_user

    mock_user = {
        "id": 2,
        "name": "trainer",
        "email": "alarm@bedpost.com",
        "valid_firstday": TODAY,
        "valid_lastday": TODAY,
        "lastlogin": TIME,
        "lastaction": TIME,
        "pass_": "pass",
        "is_admin": 0,
        "created": TIME,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "resetpassword": None,
        "language": None,
        "deleted": None,
        "usergroup": None,
    }

    users_dict[mock_user["id"]] = mock_user

    return users_dict


@pytest.fixture()
def default_user():
    return default_user_data()


@pytest.fixture()
def default_users():
    return default_users_data()


def create_default_users():
    User.insert_many(default_users_data().values()).execute()
