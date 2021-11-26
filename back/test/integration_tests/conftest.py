import pytest
from auth import get_user_token_string


@pytest.fixture()
def auth0_client(mysql_app_client):
    """Client interacting with app returned by the `mysql_app` fixture. Fetch authz
    information from Auth0 and insert it into the header of client request.
    """
    mysql_app_client.environ_base["HTTP_AUTHORIZATION"] = get_user_token_string()
    return mysql_app_client
