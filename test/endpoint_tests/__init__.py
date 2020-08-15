from functools import wraps
from unittest.mock import patch


def mock_decorator(f):
    """Fake decorator for mocking other decorators."""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)

    return decorated_function


def mock_auth_test(test_for, **kwargs):
    """Fake auth function for testing"""
    return True


patch("boxwise_flask.auth_helper.requires_auth", mock_decorator).start()
patch("boxwise_flask.auth_helper.authorization_test", mock_auth_test).start()
