import pymysql
import pytest
from boxtribute_server.db import create_db_interface, db
from boxtribute_server.models.user import User

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
