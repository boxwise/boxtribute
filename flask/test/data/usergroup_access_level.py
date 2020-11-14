import pytest
from boxwise_flask.models.usergroup_access_level import UsergroupAccessLevel


def default_usergroup_access_level_data():

    mock_usergroup_access_level = {
        "id": 1,
        "label": "12341234",
        "level": 1234,
        "shortlabel": "12341234",
    }

    return mock_usergroup_access_level


@pytest.fixture()
def default_usergroup_access_level():
    return default_usergroup_access_level_data()


def create_default_usergroup_access_level():
    UsergroupAccessLevel.create(**default_usergroup_access_level_data())
