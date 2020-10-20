from datetime import date, datetime

import pytest
from boxwise_flask.models.user import User


@pytest.fixture()
def default_user():
    mock_user = {
        "id": 1,
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
    User.create(**mock_user)
    return mock_user


@pytest.fixture()
def default_users():
    users_dict = {}

    mock_user = {
        "id": 1,
        "name": "ham",
        "email": "creps@bacon.com",
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

    users_dict[mock_user["id"]] = mock_user
    User.create(**mock_user)

    mock_user = {
        "id": 2,
        "name": "trainer",
        "email": "alarm@bedpost.com",
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
    users_dict[mock_user["id"]] = mock_user
    User.create(**mock_user)
    return users_dict
