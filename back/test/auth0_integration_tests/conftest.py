import os

import pytest
from auth import (
    TEST_AUTH0_AUDIENCE,
    TEST_AUTH0_DOMAIN,
    TEST_AUTH0_USERNAME,
    get_authorization_header,
)
from boxtribute_server.app import main
from boxtribute_server.cli import service
from boxtribute_server.db import db
from boxtribute_server.routes import api_bp, app_bp, shared_bp


@pytest.fixture
def dev_app(monkeypatch, connection_parameters):
    """Function fixture for any tests that include read-only operations on the
    `dropapp_dev` database. Use for testing the integration of the webapp (and the
    underlying ORM) with the format of the dropapp production database.
    The fixture creates a web app (exposing both the query and the full API), configured
    to connect to the `dropapp_dev` MySQL database.
    """
    monkeypatch.setenv("MYSQL_HOST", connection_parameters["host"])
    monkeypatch.setenv("MYSQL_PORT", str(connection_parameters["port"]))
    monkeypatch.setenv("MYSQL_USER", connection_parameters["user"])
    monkeypatch.setenv("MYSQL_PASSWORD", connection_parameters["password"])
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    monkeypatch.setenv("MYSQL_SOCKET", "")
    monkeypatch.setenv("MYSQL_REPLICA_SOCKET", "")

    app = main(api_bp, app_bp, shared_bp)
    app.testing = True
    yield app
    db.close_db(None)


@pytest.fixture
def dev_client(dev_app):
    with dev_app.app_context():
        yield dev_app.test_client()


@pytest.fixture
def auth0_client(dev_client):
    """Modify client interacting with 'dropapp_dev' app.
    Fetch authz information from Auth0 and insert it into the header of client request.
    """
    dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        TEST_AUTH0_USERNAME
    )
    yield dev_client


@pytest.fixture
def auth0_management_api_client(dev_app):
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
    # Force downloading and extracting of public key
    monkeypatch.setenv("AUTH0_PUBLIC_KEY", "")
