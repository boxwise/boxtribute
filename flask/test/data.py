from datetime import date, datetime

import pytest
from boxwise_flask.models.base import Base
from boxwise_flask.models.box import Box
from boxwise_flask.models.box_state import BoxState
from boxwise_flask.models.location import Location
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.qr_code import QRCode
from boxwise_flask.models.user import User


@pytest.fixture()
def default_qr_code():
    mock_qr_code = {"id": 1, "code": "999"}
    QRCode.create(**mock_qr_code)
    return mock_qr_code


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
def default_box_state():
    mock_box_state = {"id": 1, "label": 1}
    BoxState.create(**mock_box_state)
    return mock_box_state


@pytest.fixture()
def default_organisation(default_user):
    mock_organisation = {
        "id": 1,
        "label": 1,
        "created_by": default_user["id"],
        "modified_by": default_user["id"],
    }
    Organisation.create(**mock_organisation)
    return mock_organisation


@pytest.fixture()
def default_base(default_organisation):
    mock_base = {"id": 1, "seq": 1, "organisation_id": default_organisation["id"]}
    Base.create(**mock_base)
    return mock_base


@pytest.fixture()
def default_location(default_box_state, default_base):
    mock_location = {
        "id": 1,
        "box_state": default_box_state["id"],
        "base": default_base["id"],
        "container_stock": 0,
        "deleted": None,
        "is_donated": 0,
        "is_lost": 0,
        "is_market": 0,
        "is_scrap": 0,
        "label": 1,
        "seq": 1,
        "visible": 1,
    }

    Location.create(**mock_location)
    return mock_location


@pytest.fixture()
def default_box(default_box_state, default_location):
    mock_box = {
        "id": 2,
        "box_id": "abc",
        "box_state": default_box_state["id"],
        "comments": "",
        "created": datetime.now(),
        "created_by": None,
        "deleted": datetime.now(),
        "items": "None",
        "location": default_location["id"],
    }
    Box.create(**mock_box)
    return mock_box
