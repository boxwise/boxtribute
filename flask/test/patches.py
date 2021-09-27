from unittest.mock import patch

from auth import get_user_token_string


def mock_auth_test(test_for, **kwargs):
    """Fake auth function for testing"""
    return True


def mock_function_that_does_nothing(var):
    return


get_auth_string_patch = patch(
    "boxwise_flask.auth_helper.get_auth_string_from_header", get_user_token_string
)
authorization_test_patch = patch(
    "boxwise_flask.auth_helper.authorization_test", mock_auth_test
)
add_user_to_request_context_patch = patch(
    "boxwise_flask.auth_helper.add_user_to_request_context",
    mock_function_that_does_nothing,
)
