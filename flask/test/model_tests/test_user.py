import pytest
from boxwise_flask.models.user import User
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_user")
def test_user_from_email(default_user):

    queried_user = User.get_from_email(default_user["email"])
    assert model_to_dict(queried_user) == default_user


@pytest.mark.usefixtures("default_users")
def test_get_all_users(default_users):

    queried_users = User.get_all_users()
    for user in queried_users:
        assert model_to_dict(user) == default_users[user.id]
