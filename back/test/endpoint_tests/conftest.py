import pytest
from auth import mock_user_for_request

# Imports fixtures into tests
from data import *  # noqa: F401,F403


@pytest.fixture(scope="module", autouse=True)
def auth_service(module_mocker):
    """Patch any interaction with the Auth0 service for the scope of the
    `endpoint_tests` test module.
    Mimick the requesting user in an appropriate way.

    This helps to run the module's tests offline, i.e. without the requirement to
    establish an actual connection to the Auth0 web service. Also the tests are
    decoupled from any changes of user attributes in Auth0.
    """
    module_mocker.patch(
        "boxtribute_server.auth.get_auth_string_from_header"
    ).return_value = "Bearer Some.Token"
    module_mocker.patch("boxtribute_server.auth.get_public_key").return_value = None
    mock_user_for_request(module_mocker)


@pytest.fixture
def unauthorized(mocker):
    """Effectively remove any permissions from current client."""
    mock_user_for_request(mocker, permissions=[])
