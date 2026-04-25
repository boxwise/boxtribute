import pytest
from auth import mock_user_for_request
from boxtribute_server.app import create_app, register_blueprints
from boxtribute_server.db import db
from boxtribute_server.models import MODELS

# It's crucial to import the blueprints from the routes module (NOT the blueprints
# module) because only then they actually have routes registered.
from boxtribute_server.routes import api_bp, app_bp, shared_bp


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


@pytest.fixture
def app(setup_testing_database):
    """Function fixture to create the Flask back-end on top of the given database
    fixture."""
    app = create_app()
    app.debug = True
    # Omit registering before-/teardown-request handlers (cf. main()). This is crucial
    # to enable the usage of transaction rollbacks in the client fixture. Usually the
    # handlers open/close the database connection but since this cannot happen during
    # the transaction in the client fixture, they are rendered ineffective.
    register_blueprints(app, api_bp, app_bp, shared_bp)
    db.database = setup_testing_database
    db.replica = None
    with app.app_context():
        yield app


@pytest.fixture
def client(app, setup_testing_database):
    """Function fixture for any tests that include arbitrary operations on the database.
    Use for testing GraphQL queries and mutations, and data model insertions/updates.
    The fixture binds all data models to the testing database for the duration of the
    test, and returns an app client that simulates sending requests to the app.
    After each test, the applied database changes are rolled back.
    The client's authentication and authorization may be separately defined or patched.
    """
    with setup_testing_database.bind_ctx(MODELS, False, False):
        with setup_testing_database.atomic() as txn:
            yield app.test_client()
            txn.rollback()
