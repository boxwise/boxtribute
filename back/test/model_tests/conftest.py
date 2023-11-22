import pytest
from boxtribute_server.db import db

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import MODELS, setup_models


@pytest.fixture(autouse=True)
def setup_db_before_test(mysql_testing_database, mocker):
    """Automatically create all tables before each test and populate them, and drop all
    tables at tear-down.
    Patch the wrapped database of the DatabaseManager because it is uninitialized
    otherwise, and the replica database (might be set on the global DatabaseManager
    when having run integration tests before.
    """
    mocker.patch.object(db, "database", mysql_testing_database)
    mocker.patch.object(db, "replica", None)
    with mysql_testing_database.bind_ctx(MODELS):
        mysql_testing_database.drop_tables(MODELS)
        mysql_testing_database.create_tables(MODELS)
        setup_models()
        yield mysql_testing_database
