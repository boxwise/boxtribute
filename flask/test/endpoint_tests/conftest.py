import os

import pytest
from boxwise_flask.app import create_app
from boxwise_flask.db import db

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
        "boxwise_flask.auth_helper.get_auth_string_from_header"
    ).return_value = "Bearer Some.Token"
    module_mocker.patch("boxwise_flask.auth_helper.get_public_key").return_value = None
    # Skip irrelevant fields (issues, audience, issue time, expiration time,
    # client ID, grant type)
    module_mocker.patch("jose.jwt.decode").return_value = {
        "https://www.boxtribute.com/email": "dev_coordinator@boxaid.org",
        "https://www.boxtribute.com/base_ids": [1],
        "https://www.boxtribute.com/organisation_id": 1,
        "https://www.boxtribute.com/roles": ["Coordinator"],
        "sub": "auth0|8",
        "permissions": [
            "beneficiaries:write",
            "qr:create",
            "stock:write",
            "transactions:write",
        ],
    }


@pytest.fixture()
def client(app):
    """Simulate a client sending requests to the app. The client's authentication and
    authorization is defined by the patching in the `auth_service` fixture.
    """
    return app.test_client()


@pytest.fixture()
def mysql_app_client():
    """Similarly to the `client` above. The app however is configured to connect to the
    `dropapp_dev` MySQL database running on port 3306 (32000 if you test locally with
    docker-compose services).
    The fixture follows the setup-proceduce of the `main` module.
    """
    app = create_app()
    app.testing = True
    port = os.getenv("MYSQL_PORT", 3306)
    app.config["DATABASE"] = f"mysql://root:dropapp_root@127.0.0.1:{port}/dropapp_dev"

    db.init_app(app)
    client = app.test_client()
    yield client
    db.close_db(None)
