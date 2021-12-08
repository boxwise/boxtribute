"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import os

import pymysql
import pytest
from boxtribute_server.app import configure_app, create_app
from boxtribute_server.db import create_db_interface, db
from boxtribute_server.models.definitions.user import User

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models
from peewee import DeferredForeignKey

TEST_DATABASE_NAME = "testing"


@pytest.fixture(scope="package")
def mysql_testing_database(mysql_connection_parameters):
    """Create testing database, and return interface to access it.
    Requires running MySQL server (as Docker service `db`).
    """
    with pymysql.connect(**mysql_connection_parameters) as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {TEST_DATABASE_NAME}")
    yield create_db_interface(
        **mysql_connection_parameters, database=TEST_DATABASE_NAME
    )


@pytest.fixture
def mysql_testing_database_app(mysql_testing_database):
    """Fixture providing a baseline for tests that rely on database operations via
    the Flask app. Adapted from
    https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton.

    On each invocation, create the Flask app and configure it to access the
    `mysql_testing_database`.
    Create all tables before each test and populate them.
    """
    app = create_app()
    app.config["DATABASE"] = mysql_testing_database
    db.init_app(app)

    with db.database.bind_ctx(MODELS):
        db.database.drop_tables(MODELS)
        db.database.create_tables(MODELS)
        DeferredForeignKey.resolve(User)
        setup_models()
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)


@pytest.fixture
def client(mysql_testing_database_app):
    """Simulate a client sending requests to the `mysql_testing_database_app`.
    The client's authentication and authorization may be separately defined or patched.
    """
    return mysql_testing_database_app.test_client()


@pytest.fixture(scope="session")
def mysql_connection_parameters():
    return dict(
        host="127.0.0.1",
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user="root",
        password="dropapp_root",
    )


@pytest.fixture
def mysql_app(mysql_connection_parameters):
    """Set up Flask app, configured to connect to the `dropapp_dev` MySQL database
    running on port 3306 (32000 if you test locally with docker-compose services).
    """
    app = create_app()
    app.testing = True
    configure_app(
        app,
        **mysql_connection_parameters,
        database="dropapp_dev",
    )

    db.init_app(app)
    yield app
    db.close_db(None)


@pytest.fixture
def mysql_app_client(mysql_app):
    """Client interacting with app returned by the `mysql_app` fixture."""
    return mysql_app.test_client()
