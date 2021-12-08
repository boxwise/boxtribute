import pytest
from boxtribute_server.models.definitions.user import User


@pytest.mark.usefixtures("default_user")
@pytest.mark.usefixtures("default_organisation")
def test_user_from_email(
    default_user,
    default_organisation,
):

    queried_user = User.get(User.email == default_user["email"])

    assert queried_user.id == default_user["id"]
    assert queried_user.name == default_user["name"]
    assert queried_user.email == default_user["email"]


@pytest.mark.usefixtures("default_users")
@pytest.mark.usefixtures("default_organisation")
def test_get_all_users(
    default_users,
    default_organisation,
):

    queried_users = User.select()
    for user in queried_users:
        assert user.id == default_users[user.id]["id"]
        assert user.name == default_users[user.id]["name"]
        assert user.email == default_users[user.id]["email"]
