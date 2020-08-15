import os
import tempfile

import pytest

from boxwise_flask.app import create_app
from boxwise_flask.db import db
from boxwise_flask.models import Camps, Cms_Usergroups_Camps, Cms_Users, Person

MODELS = (Person, Camps, Cms_Usergroups_Camps, Cms_Users)


@pytest.fixture()
def app():
    app = create_app()

    db_fd, db_filepath = tempfile.mkstemp(suffix=".sqlite3")
    app.config["DATABASE"] = {
        "name": db_filepath,
        "engine": "peewee.SqliteDatabase",
    }

    db.init_app(app)

    with db.database.bind_ctx(MODELS):
        db.database.create_tables(MODELS)
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)
    os.close(db_fd)
    os.remove(db_filepath)


@pytest.fixture
def client(app):
    client = app.test_client()
    return client
