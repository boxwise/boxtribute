import pytest
from boxtribute_server.auth import get_token_from_auth_header
from boxtribute_server.exceptions import AuthenticationFailed


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
