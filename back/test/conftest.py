"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import os
from contextlib import contextmanager

import pymysql
import pytest
from boxtribute_server.app import configure_app, create_app
from boxtribute_server.db import create_db_interface, db

# It's crucial to import the blueprints from the routes module (NOT the blueprints
# module) because only then
# a) they actually have routes registered
# b) all data models are registered as Model subclasses (because the GraphQL schema
#    is imported into the routes module which in turn imports all data models down the
#    line); this is relevant for setup_models() to work
from boxtribute_server.routes import api_bp, app_bp, shared_bp

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models


@pytest.fixture(scope="session")
def connection_parameters():
    """Fixtures require MySQL server, host:port either
    1. 127.0.0.1:32000 when testing with pytest on local machine
    2. db:3306         when testing with pytest in webapp docker-compose service
    3. 127.0.0.1:3306  when testing in CircleCI
    For options 1 and 2, start the db docker-compose service.
    """
    return dict(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", 32000)),
        user="root",
        password="dropapp_root",
    )


@contextmanager
def _create_database(database_name, params):
    """Create database with given name, and return interface to access it.
    Requires running MySQL server (see connection_parameters docstring).
    """
    with pymysql.connect(**params) as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
    database = create_db_interface(**params, database=database_name)
    yield database
    database.execute_sql(f"DROP DATABASE IF EXISTS {database_name}")


@pytest.fixture(scope="session")
def testing_database(connection_parameters):
    """Create the testing database."""
    with _create_database("testing", connection_parameters) as database:
        yield database


@contextmanager
def _create_app(database_interface, *blueprints):
    """On each invocation, create the Flask app and configure it to access the
    `database_interface`.
    Create all tables and populate them.

    Adapted from
    https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton.

    The context manager allows to reuse the same fixture implementation with different
    scopes (cf. https://github.com/pytest-dev/pytest/issues/3425#issuecomment-383835876)
    """
    app = create_app()
    app.debug = True
    # Reset handlers before registering in db.init_app(). This is crucial to enable the
    # usage of transaction rollbacks in the client fixture. The connect_db/close_db
    # methods are registered as before/after_request handlers in the Flask app. Usually
    # they open/close the database connection but since this cannot happen during the
    # transaction in the client fixture, they are rendered ineffective.
    db.connect_db = lambda: None
    db.close_db = lambda exc: None
    configure_app(app, *blueprints, database_interface=database_interface)
    with app.app_context():
        yield app


@pytest.fixture(scope="session")
def setup_testing_database(testing_database):
    """Bind all data models to the testing database and populate it with test data."""
    with testing_database.bind_ctx(MODELS, False, False):
        testing_database.drop_tables(MODELS)
        testing_database.create_tables(MODELS)
        setup_models()
        testing_database.close()
        yield testing_database


@pytest.fixture
def app(setup_testing_database):
    """The fixture creates a web app on top of the given database fixture."""
    with _create_app(setup_testing_database, api_bp, app_bp, shared_bp) as app:
        yield app


@pytest.fixture
def client(app, setup_testing_database):
    """Function fixture for any tests that include arbitrary operations on the database.
    Use for testing GraphQL queries and mutations, and data model insertions/updates.
    The fixture returns an app client that simulates sending requests to the app.
    After each test, the applied database changes are rolled back.
    The client's authentication and authorization may be separately defined or patched.
    """
    with setup_testing_database.atomic() as txn:
        yield app.test_client()
        txn.rollback()


@pytest.fixture
def cron_client(app):
    # Don't run in atomic transaction because the code creates tables
    yield app.test_client()
