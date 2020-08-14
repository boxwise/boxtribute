import os
import tempfile

import pytest

from boxwise_flask.app import create_app
from boxwise_flask.db import db


@pytest.fixture
def client():
    app = create_app()
    db_fd, db_filepath = tempfile.mkstemp(suffix=".sqlite3")
    app.config["DATABASE"] = {
        "name": db_filepath,
        "engine": "peewee.SqliteDatabase",
    }
    db.init_app(app)

    with app.test_client() as client:
        yield client

    os.close(db_fd)
    os.remove(db_filepath)


def test_index(client):
    """Verify valid app setup by getting the landing page."""
    rv = client.get("/")
    assert b"This is a landing page" == rv.data
