"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import os
import tempfile

import pytest
from boxtribute_server.app import configure_app, create_app
from boxtribute_server.db import db
from boxtribute_server.models import MODELS

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import setup_models


@pytest.fixture()
def sqlite_app():
    """Fixture providing a baseline for tests that rely on database operations via
    the Flask app. Adapted from
    https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton.

    On each invocation, create the Flask app and a temporary Sqlite database file. Set
    up database automatically before each test by creating all tables, and drop all
    tables at tear-down.
    """
    app = create_app()

    db_fd, db_filepath = tempfile.mkstemp(suffix=".sqlite3")
    app.config["DATABASE"] = {
        "name": db_filepath,
        "engine": "peewee.SqliteDatabase",
    }

    db.init_app(app)

    with db.database.bind_ctx(MODELS):
        db.database.create_tables(MODELS)
        setup_models()
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)
    os.close(db_fd)
    os.remove(db_filepath)


@pytest.fixture()
def client(sqlite_app):
    """Simulate a client sending requests to the app returned by the `sqlite_app`
    fixture. The client's authentication and authorization may be separately defined or
    patched.
    """
    return sqlite_app.test_client()


@pytest.fixture()
def mysql_app():
    """Set up Flask app, configured to connect to the `dropapp_dev` MySQL database
    running on port 3306 (32000 if you test locally with docker-compose services).
    """
    app = create_app()
    app.testing = True
    port = os.getenv("MYSQL_PORT", 3306)
    configure_app(
        app,
        mysql_host="127.0.0.1",
        mysql_port=port,
        mysql_user="root",
        mysql_password="dropapp_root",
        mysql_db="dropapp_dev",
    )

    db.init_app(app)
    yield app
    db.close_db(None)


@pytest.fixture()
def mysql_app_client(mysql_app):
    """Client interacting with app returned by the `mysql_app` fixture."""
    return mysql_app.test_client()
