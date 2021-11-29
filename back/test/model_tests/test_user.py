import pytest
from boxtribute_server.models.user import User
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_user")
@pytest.mark.usefixtures("default_usergroup")
@pytest.mark.usefixtures("default_organisation")
@pytest.mark.usefixtures("default_usergroup_access_level")
def test_user_from_email(
    default_user,
    default_usergroup,
    default_organisation,
    default_usergroup_access_level,
):

    queried_user = User.get(User.email == default_user["email"])

    assert queried_user.id == default_user["id"]
    assert queried_user.name == default_user["name"]
    assert queried_user.email == default_user["email"]
    assert queried_user.usergroup.organisation.id == default_organisation["id"]
    assert (
        model_to_dict(queried_user)["usergroup"]["usergroup_access_level"]
        == default_usergroup_access_level
    )


@pytest.mark.usefixtures("default_users")
@pytest.mark.usefixtures("default_usergroup")
@pytest.mark.usefixtures("default_organisation")
@pytest.mark.usefixtures("default_usergroup_access_level")
def test_get_all_users(
    default_users,
    default_usergroup,
    default_organisation,
    default_usergroup_access_level,
):

    queried_users = User.select()
    for user in queried_users:
        user_dict = model_to_dict(user)
        assert user.id == default_users[user.id]["id"]
        assert user.name == default_users[user.id]["name"]
        assert user.email == default_users[user.id]["email"]
        if user_dict["usergroup"] is not None:
            assert (
                user_dict["usergroup"]["organisation"]["id"]
                == default_organisation["id"]
            )
            assert (
                user_dict["usergroup"]["usergroup_access_level"]
                == default_usergroup_access_level
            )
