import pytest
from boxtribute_server.models.usergroup_base_access import UsergroupBaseAccess
from data.base import default_bases_data
from data.usergroup import default_usergroup_data


def default_usergroup_base_access_list_data():
    mock_usergroup_base_access_dict = {}
    for base_key in default_bases_data():
        mock_usergroup_base_access = {
            "base_id": base_key,
            "usergroup_id": default_usergroup_data()["id"],
        }

        mock_usergroup_base_access_dict[base_key] = mock_usergroup_base_access

    return mock_usergroup_base_access_dict


@pytest.fixture()
def default_usergroup_base_access_list():
    return default_usergroup_base_access_list_data()


def create():
    UsergroupBaseAccess.insert_many(
        default_usergroup_base_access_list_data().values()
    ).execute()
