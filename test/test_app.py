import os
import tempfile

import pytest

from boxwise_flask.app import db
from boxwise_flask.routes import app


@pytest.fixture
def client():
    db_fd, db_filepath = tempfile.mkstemp(suffix=".sqlite3")
    app.config["DATABASE"] = {
        "name": db_filepath,
        "engine": "peewee.SqliteDatabase",
    }
    db.load_database()

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    os.remove(db_filepath)


def test_index(client):
    """Verify valid app setup by getting the landing page."""
    rv = client.get("/")
    assert b"This is a landing page" == rv.data
