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

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models

MYSQL_CONNECTION_PARAMETERS = dict(
    # Fixtures require local MySQL server on port 3306 in CircleCI / 32000 on dev
    # machine using docker-compose services
    host="127.0.0.1",
    port=int(os.getenv("MYSQL_PORT", 3306)),
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
    yield create_db_interface(**MYSQL_CONNECTION_PARAMETERS, database=database_name)


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


@contextmanager
def _create_app(database_interface):
    """On each invocation, create the Flask app and configure it to access the
    `database_interface`.
    Create all tables and populate them.

    Adapted from
    https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton.

    The context manager allows to reuse the same fixture implementation with different
    scopes (cf. https://github.com/pytest-dev/pytest/issues/3425#issuecomment-383835876)
    """
    app = create_app()
    app.config["DATABASE"] = database_interface
    db.init_app(app)

    with db.database.bind_ctx(MODELS):
        db.database.drop_tables(MODELS)
        db.database.create_tables(MODELS)
        setup_models()
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)


@pytest.fixture(scope="session")
def read_only_client(mysql_testing_database_read_only):
    """Session fixture for any tests that include read-only operations on the database.
    Use for testing GraphQL queries, and data model selections.
    The fixture creates a web app on top of the given database fixture, and returns an
    app client that simulates sending requests to the app.
    The client's authentication and authorization may be separately defined or patched.
    """
    with _create_app(mysql_testing_database_read_only) as app:
        yield app.test_client()


@pytest.fixture
def client(mysql_testing_database):
    """Function fixture for any tests that include arbitrary operations on the database.
    Use for testing GraphQL mutations, and data model insertions/updates.
    The fixture creates a web app on top of the given database fixture, and returns an
    app client that simulates sending requests to the app.
    The client's authentication and authorization may be separately defined or patched.
    """
    with _create_app(mysql_testing_database) as app:
        yield app.test_client()


@pytest.fixture
def dropapp_dev_client():
    """Function fixture for any tests that include read-only operations on the
    `dropapp_dev` database. Use for testing the integration of the webapp (and the
    underlying ORM) with the format of the dropapp production database.
    The fixture creates a web app, configured to connect to the `dropapp_dev` MySQL
    database, and returns a client that simulates sending requests to the app.
    """
    app = create_app()
    app.testing = True
    configure_app(
        app,
        **MYSQL_CONNECTION_PARAMETERS,
        database="dropapp_dev",
    )

    db.init_app(app)
    with db.database.bind_ctx(MODELS):
        with app.app_context():
            yield app.test_client()
    db.close_db(None)
