import pytest
from boxtribute_server.models.definitions.usergroup_base_access import (
    UsergroupBaseAccess,
)
from data.base import data as base_data
from data.usergroup import default_usergroup_data


def default_usergroup_base_access_list_data():
    mock_usergroup_base_access_dict = {}
    for base in base_data():
        base_key = base["id"]
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
