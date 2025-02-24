from datetime import date

import pytest
from boxtribute_server.models.definitions.user import User
from boxtribute_server.models.utils import utcnow

TIME = utcnow().replace(tzinfo=None)
TODAY = date.today()


def default_user_data():
    return {
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
        "_usergroup": 3,
    }


def second_user_data():
    data = default_user_data()
    data["id"] = 2
    data["name"] = "trainer"
    data["email"] = "alarm@bedpost.com"
    data["_usergroup"] = 4
    return data


def god_user_data():
    data = default_user_data()
    data["id"] = 3
    data["name"] = "god"
    data["email"] = "god@boxtribute.org"
    data["is_admin"] = 1
    data["valid_first_day"] = None
    data["valid_last_day"] = None
    data["_usergroup"] = None
    return data


def base2_coordinator_data():
    data = default_user_data()
    data["id"] = 4
    data["name"] = "coordinator"
    data["email"] = "coordinator@basetwo.org"
    data["_usergroup"] = 6
    return data


def base2_volunteer_data():
    data = default_user_data()
    data["id"] = 5
    data["name"] = "volunteer"
    data["email"] = "volunteer@basetwo.org"
    data["_usergroup"] = 7
    return data


def deleted_user_data():
    data = default_user_data()
    data["id"] = 6
    data["name"] = "deleted user"
    data["email"] = "a.b@web.de.deleted.1031.deleted.1031"
    data["deleted"] = TODAY
    return data


def another_deleted_user_data():
    data = deleted_user_data()
    data["id"] = 7
    data["email"] = "a.b@gmail.com.deleted.124"
    return data


def another_user_data():
    data = default_user_data()
    data["id"] = 8
    data["name"] = "coord"
    data["email"] = "dev_coordinator@boxaid.org"
    data["_usergroup"] = 2
    return data


def data():
    return [
        default_user_data(),
        god_user_data(),
        second_user_data(),
        another_user_data(),
        base2_coordinator_data(),
        base2_volunteer_data(),
        deleted_user_data(),
        another_deleted_user_data(),
    ]


@pytest.fixture
def default_user():
    return default_user_data()


@pytest.fixture
def default_users():
    return data()


@pytest.fixture
def god_user():
    return god_user_data()


@pytest.fixture
def another_user():
    return another_user_data()


def create():
    User.insert_many(data()).execute()
