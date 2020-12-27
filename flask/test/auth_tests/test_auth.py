from auth_tests.auth import get_user_token_string
import pytest
from unittest.mock import patch

get_auth_string_patch = patch("boxwise_flask.auth_helper.get_auth_string_from_header", get_user_token_string)
get_auth_string_patch.start()

from boxwise_flask.auth_helper import (  # ,; decode_jwt,; requires_auth,; 
    user_can_access_base,
    authorization_test,
    get_rsa_key,
    get_token_from_auth_header,
    AuthError
)

def test_decode_valid_jwt():
    test = get_token_from_auth_header(get_user_token_string())
    key = get_rsa_key(test)
    assert key != None

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
        a = authorization_test("hello")
        print(a)