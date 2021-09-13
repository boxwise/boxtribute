"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import pytest
from boxwise_flask.models import MODELS

# Imports fixtures into tests
from data import *  # noqa: F401,F403
from data.setup_tables import setup_tables
from peewee import SqliteDatabase


@pytest.fixture(autouse=True)
def setup_db_before_test():
    """Sets up database automatically before each test"""
    _db = SqliteDatabase(":memory:")
    with _db.bind_ctx(MODELS):
        _db.create_tables(MODELS)
        setup_tables()
        yield _db
        _db.drop_tables(MODELS)
