import pytest
from boxwise_flask.auth_helper import (
    authorize,
    get_token_from_auth_header,
    user_can_access_base,
)
from boxwise_flask.exceptions import AuthenticationFailed, UnknownResource


def test_get_invalid_jwt_no_auth_header():
    with pytest.raises(AuthenticationFailed):
        get_token_from_auth_header(None)


def test_get_invalid_jwt_no_bearer():
    with pytest.raises(AuthenticationFailed):
        get_token_from_auth_header("no bearer")


def test_get_invalid_jwt_bearer_no_token():
    with pytest.raises(AuthenticationFailed):
        get_token_from_auth_header("bearer")


def test_get_invalid_jwt_bearer_with_additonal_data():
    with pytest.raises(AuthenticationFailed):
        get_token_from_auth_header("bearer token additional")


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
