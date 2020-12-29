from functools import wraps
from unittest.mock import patch
from auth import get_user_token_string

def mock_decorator(f):
    """Fake decorator for mocking other decorators."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)

    return decorated_function


def mock_auth_test(test_for, **kwargs):
    """Fake auth function for testing"""
    return True



get_auth_string_patch = patch("boxwise_flask.auth_helper.get_auth_string_from_header", get_user_token_string)
requires_auth_patch = patch("boxwise_flask.auth_helper.requires_auth", mock_decorator)
authorization_test_patch = patch("boxwise_flask.auth_helper.authorization_test", mock_auth_test)