import pytest
from boxwise_flask.models.usergroup_access_level import UsergroupAccessLevel


@pytest.fixture()
def default_usergroup_access_level():

    mock_usergroup_access_level = {
        "id": 1,
        "label": "12341234",
        "level": 1234,
        "shortlabel": "12341234",
    }
    UsergroupAccessLevel.create(**mock_usergroup_access_level)
    return mock_usergroup_access_level
