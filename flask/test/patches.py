from unittest.mock import patch


def mock_auth_test(test_for, **kwargs):
    """Fake auth function for testing"""
    return True


authorization_test_patch = patch(
    "boxwise_flask.auth_helper.authorization_test", mock_auth_test
)
