from datetime import datetime

import pytest
from boxwise_flask.models.usergroup import Usergroup


@pytest.fixture()
def default_usergroup(
    default_organisation, default_usergroup_access_level, default_user
):

    mock_usergroup = {
        "id": 1,
        "created": datetime.now(),
        "created_by": default_user["id"],
        "deleted": datetime.now(),
        "label": 12341234,
        "modified": 12341234,
        "modified_by": default_user["id"],
        "organisation": default_organisation["id"],
        "usergroup_access_level": default_usergroup_access_level["id"],
    }

    Usergroup.create(**mock_usergroup)
    return mock_usergroup
