"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import os

import pymysql
import pytest
from boxtribute_server.db import create_db_interface
from boxtribute_server.models import MODELS

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data import setup_models


@pytest.fixture(scope="session")
def connection_parameters():
    """Fixtures require MySQL server, host:port either
    1. 127.0.0.1:32000 when testing with pytest on local machine
    2. db:3306         when testing with pytest in webapp docker-compose service
    3. 127.0.0.1:3306  when testing in CircleCI
    For options 1 and 2, start the db docker-compose service.
    """
    return dict(
        host=os.getenv("MYSQL_HOST", "127.0.0.1"),
        port=int(os.getenv("MYSQL_PORT", 32000)),
        user="root",
        password="dropapp_root",
    )


@pytest.fixture(scope="session")
def testing_database(connection_parameters):
    """Create testing database, and return interface to access it.
    Requires running MySQL server (see connection_parameters docstring).
    """
    database_name = "testing"
    with pymysql.connect(**connection_parameters) as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
    database = create_db_interface(**connection_parameters, database=database_name)
    yield database
    database.execute_sql(f"DROP DATABASE IF EXISTS {database_name}")


@pytest.fixture(scope="session")
def setup_testing_database(testing_database):
    """Bind all data models to the testing database and populate it with test data."""
    with testing_database.bind_ctx(MODELS, False, False):
        testing_database.drop_tables(MODELS)
        testing_database.create_tables(MODELS)
        setup_models()
        testing_database.close()
    yield testing_database
