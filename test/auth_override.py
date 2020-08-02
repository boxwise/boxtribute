from functools import wraps
from unittest.mock import patch


def mock_decorator(*args, **kwargs):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            print("called")
            return f(*args, **kwargs)

        return decorated_function

    return decorator


def patch_auth():
    patch("boxwise_flask.auth_helper.requires_auth", mock_decorator()).start()
