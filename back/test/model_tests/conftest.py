import pytest
from boxtribute_server.db import db

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models
from peewee import SqliteDatabase


@pytest.fixture(autouse=True)
def setup_db_before_test(mocker):
    """Set up database automatically before each test by creating all tables, and drop
    all tables at tear-down.
    Patch the wrapped database of the FlaskDB because it is uninitialized otherwise.
    """
    _db = SqliteDatabase(":memory:")
    mocker.patch.object(db, "database", _db)

    with _db.bind_ctx(MODELS):
        _db.create_tables(MODELS)
        setup_models()
        yield _db
        _db.drop_tables(MODELS)
