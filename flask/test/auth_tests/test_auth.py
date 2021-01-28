import pytest
from auth import get_user_token_string

from patches import get_auth_string_patch
from patches import authorization_test_patch
from patches import requires_auth_patch
from patches import add_user_to_request_context_patch

#avoid the request context to test auth functions
add_user_to_request_context_patch.start()
# Patch the function to get auth token from request header
get_auth_string_patch.start()
# as we are testing the auth functions here stop the patches that effect this
authorization_test_patch.stop()
requires_auth_patch.stop()

from boxwise_flask.auth_helper import (  # ,; decode_jwt,; requires_auth,; 
    user_can_access_base,
    authorization_test,
    get_rsa_key,
    get_token_from_auth_header,
    AuthError,
    requires_auth,
    decode_jwt
)

def test_get_valid_jwt():
    token = get_token_from_auth_header(get_user_token_string())
    key = get_rsa_key(token)
    assert key != None

def test_get_invalid_jwt_no_auth_header():
    with pytest.raises(AuthError):
        get_token_from_auth_header(None)

def test_get_invalid_jwt_no_bearer():
    with pytest.raises(AuthError):
        get_token_from_auth_header("no bearer")

def test_get_invalid_jwt_bearer_no_token():
    with pytest.raises(AuthError):
        get_token_from_auth_header("bearer")

def test_get_invalid_jwt_bearer_with_additonal_data():
    with pytest.raises(AuthError):
        get_token_from_auth_header("bearer token additional")

def test_user_can_access_base_valid_user():
    user = {
      "base_ids": [1]
    }
    assert user_can_access_base(user, 1)

def test_user_can_access_base_no_base_ids():
    user = {}
    assert not user_can_access_base(user, 1)

def test_user_can_access_base_invalid_base_ids():
    user = {
      "base_ids": [2]
    }
    assert not user_can_access_base(user, 1)

def test_authorization_test_bases_valid():
    assert authorization_test("bases", base_id=1)

def test_authorization_test_bases_invalid():
    with pytest.raises(AuthError):
        authorization_test("bases", base_id=10)

def test_requires_auth_valid():

    @requires_auth
    def function_that_needs_auth():
        return True

    assert function_that_needs_auth()

def test_requires_auth_invalid_key(mocker):
    mocker.patch("boxwise_flask.auth_helper.get_rsa_key", return_value=None)
    @requires_auth
    def function_that_needs_auth():
        return True
    with pytest.raises(AuthError):
        function_that_needs_auth()

def test_decode_valid_jwt():
    token = get_token_from_auth_header(get_user_token_string())
    key = get_rsa_key(token)
    assert decode_jwt(token, key) != None