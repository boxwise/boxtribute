import pytest
from boxwise_flask.authz import authorize, user_can_access_base
from boxwise_flask.exceptions import UnknownResource


def test_user_can_access_base_valid_user():
    user = {"base_ids": [1]}
    assert user_can_access_base(user, 1)


def test_user_can_access_base_no_base_ids():
    user = {}
    assert not user_can_access_base(user, 1)


def test_user_can_access_base_invalid_base_ids():
    user = {"base_ids": [2]}
    assert not user_can_access_base(user, 1)


def test_invalid_authorization_resource():
    with pytest.raises(UnknownResource):
        authorize()
