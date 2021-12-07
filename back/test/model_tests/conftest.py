import pytest
from boxtribute_server.db import db
from boxtribute_server.models.user import User

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models
from peewee import DeferredForeignKey


@pytest.fixture(autouse=True)
def setup_db_before_test(mysql_testing_database, mocker):
    """Automatically create all tables before each test and populate them, and drop all
    tables at tear-down.
    Patch the wrapped database of the FlaskDB because it is uninitialized otherwise.
    """
    mocker.patch.object(db, "database", mysql_testing_database)
    with mysql_testing_database.bind_ctx(MODELS):
        mysql_testing_database.drop_tables(MODELS)
        mysql_testing_database.create_tables(MODELS)
        DeferredForeignKey.resolve(User)
        setup_models()
        yield mysql_testing_database
        mysql_testing_database.drop_tables(MODELS)
