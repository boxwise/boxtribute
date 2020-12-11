from auth import get_user_token_string
from boxwise_flask.auth_helper import (  # authorization_test,; decode_jwt,; requires_auth,; 
    user_can_access_base,
    get_rsa_key,
    get_token_from_auth_header,
)

def test_decode_valid_jwt():
    test = get_token_from_auth_header(get_user_token_string())
    key = get_rsa_key(test)
    assert key != None

def test_decode_valid_jwt():
    user = {
      "base_ids": [1]
    }
    assert user_can_access_base(user, 1)
