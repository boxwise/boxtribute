import pytest
from boxwise_flask.models.user import User
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_user")
def test_user_creation(default_user):
    """Verify inserting test rows."""

    queried_user = User.get_user(default_user["email"])
    assert model_to_dict(queried_user) == default_user
