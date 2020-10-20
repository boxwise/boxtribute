import pytest
from boxwise_flask.models.usergroup_base_access import UsergroupBaseAccess


@pytest.fixture()
def default_usergroup_base_access_list(default_bases, default_usergroup):

    mock_usergroup_base_access_dict = {}
    for base_key in default_bases:
        mock_usergroup_base_access = {
            "base_id": base_key,
            "usergroup_id": default_usergroup["id"],
        }

        UsergroupBaseAccess.create(**mock_usergroup_base_access)

        mock_usergroup_base_access_dict[base_key] = mock_usergroup_base_access

    return mock_usergroup_base_access_dict
