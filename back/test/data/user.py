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
    }


def second_user_data():
    return {
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
    }


def another_user_data():
    return {
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
    }


def data():
    return [default_user_data(), second_user_data(), another_user_data()]


@pytest.fixture
def default_user():
    return default_user_data()


@pytest.fixture
def default_users():
    return data()


@pytest.fixture
def another_user():
    return another_user_data()


def create():
    User.insert_many(data()).execute()
