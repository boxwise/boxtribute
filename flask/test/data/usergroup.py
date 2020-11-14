from datetime import datetime

import pytest
from boxwise_flask.models.usergroup import Usergroup
from data.organisation import default_organisation_data
from data.usergroup_access_level import default_usergroup_access_level_data

TIME = datetime.now()


def default_usergroup_data():
    mock_usergroup = {
        "id": 1,
        "created": TIME,
        "created_by": None,
        "deleted": TIME,
        "label": "12341234",
        "modified": 12341234,
        "modified_by": None,
        "organisation": default_organisation_data()["id"],
        "usergroup_access_level": default_usergroup_access_level_data()["id"],
    }

    return mock_usergroup


@pytest.fixture()
def default_usergroup():
    return default_usergroup_data()


def create_default_usergroup():
    Usergroup.create(**default_usergroup_data())
