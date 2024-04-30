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
from boxtribute_server.app import configure_app, create_app, main
from boxtribute_server.db import create_db_interface, db

# It's crucial to import the blueprints from the routes module (NOT the blueprints
# module) because only then
# a) they actually have routes registered
# b) all data models are registered as db.Model subclasses (because the GraphQL schema
#    is imported into the routes module which in turn imports all data models down the
#    line); this is relevant for setup_models() to work
from boxtribute_server.routes import api_bp, app_bp

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models

MYSQL_CONNECTION_PARAMETERS = dict(
    # Fixtures require MySQL server, host:port either
    # - 127.0.0.1:32000 when testing without container on local machine
    # - db:3306         when testing in container on local machine
    # - 127.0.0.1:3306  when testing in CircleCI
    host=os.getenv("MYSQL_HOST", "127.0.0.1"),
    port=int(os.getenv("MYSQL_PORT", 32000)),
    user="root",
    password="dropapp_root",
)


@contextmanager
def _create_database(database_name):
    """Create database with given name, and return interface to access it.
    Requires running MySQL server (as Docker service `db`).
    """
    with pymysql.connect(**MYSQL_CONNECTION_PARAMETERS) as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
    database = create_db_interface(
        **MYSQL_CONNECTION_PARAMETERS, database=database_name
    )
    yield database
    database.execute_sql(f"DROP DATABASE IF EXISTS {database_name}")


@pytest.fixture(scope="session")
def mysql_testing_database_read_only():
    """Session fixture providing a database interface for read-only operations."""
    with _create_database("testingreadonly") as database:
        yield database


@pytest.fixture(scope="session")
def mysql_testing_database():
    """Session fixture providing a database interface for arbitrary operations."""
    with _create_database("testing") as database:
        yield database


@pytest.fixture(scope="session")
def mysql_cron_database():
    """Session fixture providing a database interface for cron tests."""
    with _create_database("cron") as database:
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
    configure_app(app, *blueprints, database_interface=database_interface)

    with db.database.bind_ctx(MODELS):
        db.database.drop_tables(MODELS)
        db.database.create_tables(MODELS)
        setup_models()
        db.database.close()
        with app.app_context():
            yield app

    db.database.close()


@pytest.fixture(scope="session")
def read_only_client(mysql_testing_database_read_only):
    """Session fixture for any tests that include read-only operations on the database.
    Use for testing GraphQL queries, and data model selections.
    The fixture creates a web app on top of the given database fixture, and returns an
    app client that simulates sending requests to the app.
    The client's authentication and authorization may be separately defined or patched.
    """
    with _create_app(mysql_testing_database_read_only, api_bp, app_bp) as app:
        yield app.test_client()


@pytest.fixture
def client(mysql_testing_database):
    """Function fixture for any tests that include arbitrary operations on the database.
    Use for testing GraphQL mutations, and data model insertions/updates.
    The fixture creates a web app on top of the given database fixture, and returns an
    app client that simulates sending requests to the app.
    The client's authentication and authorization may be separately defined or patched.
    """
    with _create_app(mysql_testing_database, api_bp, app_bp) as app:
        yield app.test_client()


@pytest.fixture
def cron_client(mysql_cron_database):
    with _create_app(mysql_cron_database, app_bp) as app:
        yield app.test_client()


@pytest.fixture
def mysql_dev_database(monkeypatch):
    """Function fixture for any tests that include read-only operations on the
    `dropapp_dev` database. Use for testing the integration of the webapp (and the
    underlying ORM) with the format of the dropapp production database.
    The fixture creates a web app (exposing both the query and the full API), configured
    to connect to the `dropapp_dev` MySQL database, and returns a client that simulates
    sending requests to the app.
    """
    monkeypatch.setenv("MYSQL_HOST", MYSQL_CONNECTION_PARAMETERS["host"])
    monkeypatch.setenv("MYSQL_PORT", str(MYSQL_CONNECTION_PARAMETERS["port"]))
    monkeypatch.setenv("MYSQL_USER", MYSQL_CONNECTION_PARAMETERS["user"])
    monkeypatch.setenv("MYSQL_PASSWORD", MYSQL_CONNECTION_PARAMETERS["password"])
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    monkeypatch.setenv("MYSQL_SOCKET", "")
    monkeypatch.setenv("MYSQL_REPLICA_SOCKET", "")

    app = main(api_bp, app_bp)
    app.testing = True

    with db.database.bind_ctx(MODELS):
        db.database.create_tables(MODELS)
        db.database.close()
        db.replica.close()
        yield app
    db.database.close()
    db.replica.close()


@pytest.fixture
def dropapp_dev_client(mysql_dev_database):
    with mysql_dev_database.app_context():
        yield mysql_dev_database.test_client()
