import os
import tempfile

import pytest
from boxwise_flask.app import create_app
from boxwise_flask.db import db
from boxwise_flask.models import MODELS

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data.setup_tables import setup_tables


@pytest.fixture()
def app():
    """Fixture providing a baseline for tests that rely on database operations via
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
