import pytest
from boxwise_flask.models.user import User, get_user_from_email_with_base_ids
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

    queried_user = User.get_from_email(default_user["email"])

    assert queried_user.id == default_user["id"]
    assert queried_user.name == default_user["name"]
    assert queried_user.email == default_user["email"]
    assert (
        model_to_dict(queried_user)["usergroup"]["organisation"] == default_organisation
    )
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

    queried_users = User.get_all_users()
    for user in queried_users:
        user_dict = model_to_dict(user)
        assert user.id == default_users[user.id]["id"]
        assert user.name == default_users[user.id]["name"]
        assert user.email == default_users[user.id]["email"]
        if user_dict["usergroup"] is not None:
            assert user_dict["usergroup"]["organisation"] == default_organisation
            assert (
                user_dict["usergroup"]["usergroup_access_level"]
                == default_usergroup_access_level
            )


@pytest.mark.usefixtures("default_user")
@pytest.mark.usefixtures("default_usergroup")
@pytest.mark.usefixtures("default_organisation")
@pytest.mark.usefixtures("default_usergroup_access_level")
@pytest.mark.usefixtures("default_usergroup_access_level")
@pytest.mark.usefixtures("default_bases")
def test_get_user_from_email_with_base_ids(
    default_user,
    default_usergroup,
    default_organisation,
    default_usergroup_access_level,
    default_bases,
):
    user_with_base_ids = get_user_from_email_with_base_ids(default_user["email"])

    assert user_with_base_ids["id"] == default_user["id"]
    assert user_with_base_ids["name"] == default_user["name"]
    assert user_with_base_ids["email"] == default_user["email"]
    assert user_with_base_ids["usergroup"]["organisation"] == default_organisation
    assert (
        user_with_base_ids["usergroup"]["usergroup_access_level"]
        == default_usergroup_access_level
    )
    # the data is created such that the default usergroup is used for all base_ids
    # therefore all the default base ids should be returned
    assert user_with_base_ids["base_ids"] == [base for base in default_bases]
