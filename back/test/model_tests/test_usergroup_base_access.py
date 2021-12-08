import pytest
from boxtribute_server.models.definitions.usergroup_base_access import (
    UsergroupBaseAccess,
)


@pytest.mark.usefixtures("default_usergroup_base_access_list")
def test_get_all_base_ids_for_usergroup_id(default_usergroup_base_access_list):

    first_base_id = list(default_usergroup_base_access_list.keys())[0]
    base_ids = UsergroupBaseAccess.get_all_base_id_for_usergroup_id(
        default_usergroup_base_access_list[first_base_id]["usergroup_id"]
    )

    for base_id in base_ids:
        assert base_id == default_usergroup_base_access_list[base_id]["base_id"]
