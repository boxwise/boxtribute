from functools import wraps
from unittest.mock import patch


def mock_decorator(*args, **kwargs):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)

        return decorated_function

    return decorator


patch("boxwise_flask.auth_helper.requires_auth", mock_decorator()).start()
