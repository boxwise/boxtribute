"""Functionality for common test setups.
See https://docs.pytest.org/en/stable/fixture.html#conftest-py-sharing-fixture-functions

In general, pass fixtures as arguments to a pytest test function in order to base the
test function on those fixtures. No additional import in the test module is required if
the fixture is defined in the 'conftest' module.

More details about the mechanism behind fixtures, and predefined fixtures at
https://docs.pytest.org/en/stable/fixture.html#pytest-fixtures-explicit-modular-scalable
"""

# Imports fixtures into tests
from test.data.base import default_base  # noqa: F401
from test.data.box import default_box  # noqa: F401
from test.data.box_state import default_box_state  # noqa: F401
from test.data.location import default_location  # noqa: F401
from test.data.organisation import default_organisation  # noqa: F401
from test.data.qr_code import default_qr_code  # noqa: F401
from test.data.user import default_user  # noqa: F401

import pytest
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
from peewee import SqliteDatabase

MODELS = (
    QRCode,
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
    Size,
    SizeRange,
    User,
    Usergroup,
    UsergroupAccessLevel,
    UsergroupBaseAccess,
)


@pytest.fixture(autouse=True)
def setup_db_before_test():
    """Sets up database automatically before each test"""
    _db = SqliteDatabase(":memory:")
    with _db.bind_ctx(MODELS):
        _db.create_tables(MODELS)
        yield _db
        _db.drop_tables(MODELS)
