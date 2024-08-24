import os

import pytest
from auth import (
    TEST_AUTH0_AUDIENCE,
    TEST_AUTH0_DOMAIN,
    TEST_AUTH0_USERNAME,
    get_authorization_header,
)
from boxtribute_server.cli import service


@pytest.fixture
def auth0_client(dropapp_dev_client):
    """Modify client interacting with 'dropapp_dev' app.
    Fetch authz information from Auth0 and insert it into the header of client request.
    """
    dropapp_dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        TEST_AUTH0_USERNAME
    )
    yield dropapp_dev_client


@pytest.fixture
def auth0_management_api_client(mysql_dev_database):
    client = service.Auth0Service.connect(
        domain=TEST_AUTH0_DOMAIN,
        client_id=os.environ["TEST_AUTH0_MANAGEMENT_API_CLIENT_ID"],
        secret=os.environ["TEST_AUTH0_MANAGEMENT_API_CLIENT_SECRET"],
    )
    yield client


@pytest.fixture(autouse=True)
def auth0_testing(monkeypatch):
    # These variables have different values depending on the CircleCI context, hence
    # hard-code them for reproducible, context-independent tests
    monkeypatch.setenv("AUTH0_DOMAIN", TEST_AUTH0_DOMAIN)
    monkeypatch.setenv("AUTH0_AUDIENCE", TEST_AUTH0_AUDIENCE)
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_DOMAIN", TEST_AUTH0_DOMAIN)
    client_id = os.environ["TEST_AUTH0_MANAGEMENT_API_CLIENT_ID"]
    secret = os.environ["TEST_AUTH0_MANAGEMENT_API_CLIENT_SECRET"]
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_CLIENT_ID", client_id)
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_CLIENT_SECRET", secret)
    monkeypatch.setenv("AUTH0_PUBLIC_KEY", "")
