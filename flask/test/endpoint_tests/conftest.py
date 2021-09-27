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
from boxwise_flask.app import create_app
from boxwise_flask.db import db
from boxwise_flask.models import MODELS

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data.setup_tables import setup_tables
from patches import authorization_test_patch

authorization_test_patch.start()


@pytest.fixture()
def app():
    """Fixture providing a baseline for unit tests that rely on database operations via
    the Flask app. Adapted from
    https://flask.palletsprojects.com/en/1.1.x/testing/#the-testing-skeleton."""
    app = create_app()

    db_fd, db_filepath = tempfile.mkstemp(suffix=".sqlite3")
    app.config["DATABASE"] = {
        "name": db_filepath,
        "engine": "peewee.SqliteDatabase",
    }

    db.init_app(app)

    with db.database.bind_ctx(MODELS):
        db.database.create_tables(MODELS)
        setup_tables()
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)
    os.close(db_fd)
    os.remove(db_filepath)


@pytest.fixture()
def client(app):
    """The fixture simulates a client sending requests to the app."""
    client = app.test_client()
    return client


@pytest.fixture()
def mysql_app_client():
    """Follow the setup-proceduce of the main module. Note that the fixture
    requires a MySQL database server running on port 3306 (32000 if you test
    locally with docker-compose services).
    """
    app = create_app()
    app.testing = True
    # cf. main.py but inserting values from docker-compose.yml
    port = os.getenv("MYSQL_PORT", 3306)
    app.config["DATABASE"] = f"mysql://root:dropapp_root@127.0.0.1:{port}/dropapp_dev"

    db.init_app(app)
    yield app.test_client()
    db.close_db(None)
