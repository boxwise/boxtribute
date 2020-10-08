"""Functionality for common test setups.
See https://docs import
test.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs import
test.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

import os
import tempfile

import pytest

from boxwise_flask.app import create_app
from boxwise_flask.db import db
from boxwise_flask.models.base import Base
from boxwise_flask.models.base_module import BaseModule
from boxwise_flask.models.box import Box
from boxwise_flask.models.box_state import BoxState
from boxwise_flask.models.language import Language
from boxwise_flask.models.location import Location
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.product import Product
from boxwise_flask.models.product_category import ProductCategory
from boxwise_flask.models.product_gender import ProductGender
from boxwise_flask.models.qr_code import QRCode
from boxwise_flask.models.size import Size
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.user import User
from boxwise_flask.models.usergroup import Usergroup
from boxwise_flask.models.usergroup_access_level import UsergroupAccessLevel
from boxwise_flask.models.usergroup_base_access import UsergroupBaseAccess

MODELS = (
    Base,
    BaseModule,
    Box,
    BoxState,
    Language,
    Location,
    Organisation,
    Product,
    ProductCategory,
    ProductGender,
    QRCode,
    Size,
    SizeRange,
    User,
    Usergroup,
    UsergroupAccessLevel,
    UsergroupBaseAccess,
)


@pytest.fixture()
def app():
    """Fixture providing a baseline for unit tests that rely on database operations via
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
        db.close_db(None)
        with app.app_context():
            yield app

    db.close_db(None)
    os.close(db_fd)
    os.remove(db_filepath)


@pytest.fixture
def client(app):
    """The fixture simulates a client sending requests to the app."""
    client = app.test_client()
    return client
