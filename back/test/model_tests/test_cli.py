import csv
import pathlib
import tempfile
from datetime import date
from unittest.mock import MagicMock

import peewee
import pytest
from boxtribute_server.cli.main import _create_db_interface, _parse_options
from boxtribute_server.cli.products import (
    PRODUCT_COLUMN_NAMES,
    clone_products,
    import_products,
)
from boxtribute_server.cli.remove_base_access import (
    AUTH0_ADMIN_ROLE_ID,
    _get_admin_usergroup_id,
    _get_non_admin_role_ids,
    _get_non_admin_user_ids,
    _get_non_admin_usergroup_ids,
    remove_base_access,
)
from boxtribute_server.cli.service import Auth0Service, _user_data_without_base_id
from boxtribute_server.cli.utils import Struct
from boxtribute_server.db import db
from boxtribute_server.models.definitions.product import Product
from boxtribute_server.models.definitions.user import User


@pytest.fixture
def valid_data():
    return [
        {
            "name": "coats",
            "category": 6,
            "gender": 1,
            "size_range": 1,
            "base": 1,
            "price": 20,
            "in_shop": 0,
            "comment": "",
        },
        {
            "name": "umbrellas",
            "category": 13,
            "gender": 1,
            "size_range": 1,
            "base": 2,
            "price": 10,
            "in_shop": 0,
            "comment": "yellow color",
        },
    ]


def write_to_csv(*, filepath, data, fieldnames):
    with open(filepath, mode="w", newline="") as data_file:
        writer = csv.DictWriter(data_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


# Note that yielding the filepath prevents from exiting the tempfile context manager
# which would otherwise result in automatic deletion of the temporary directory before
# it is even used by the test
@pytest.fixture
def valid_data_filepath(valid_data):
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "valid_data.csv"
        write_to_csv(
            filepath=filepath, data=valid_data, fieldnames=PRODUCT_COLUMN_NAMES
        )
        yield filepath


@pytest.fixture
def empty_filepath():
    with tempfile.NamedTemporaryFile(mode="w", newline="", suffix=".csv") as tmpfile:
        yield tmpfile.name


@pytest.fixture
def only_header_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "only_header.csv"
        write_to_csv(filepath=filepath, data=[], fieldnames=PRODUCT_COLUMN_NAMES)
        yield filepath


@pytest.fixture
def invalid_data_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "invalid_data.csv"
        write_to_csv(filepath=filepath, data=[{"invalid": 0}], fieldnames=["invalid"])
        yield filepath


@pytest.fixture
def invalid_typed_data_filepath():
    with tempfile.TemporaryDirectory() as tmpdir:
        filepath = pathlib.Path(tmpdir) / "invalid_data.csv"
        write_to_csv(
            filepath=filepath,
            data=[
                {
                    "name": "coats",
                    "category": "Clothing",  # should be valid int
                    "gender": 1,
                    "size_range": 1,
                    "base": 1,
                    "price": 20,
                    "in_shop": 0,
                    "comment": "",
                }
            ],
            fieldnames=PRODUCT_COLUMN_NAMES,
        )
        yield filepath


def test_parse_options():
    assert _parse_options("import-products -f data.csv".split()) == {
        "command": "import-products",
        "data_filepath": "data.csv",
        "database": None,
        "password": None,
        "user": None,
        "host": "127.0.0.1",
        "port": 3386,
        "verbose": False,
    }

    assert _parse_options("clone-products -s 1 -t 2".split()) == {
        "command": "clone-products",
        "source_base_id": 1,
        "target_base_id": 2,
        "database": None,
        "password": None,
        "user": None,
        "host": "127.0.0.1",
        "port": 3386,
        "verbose": False,
    }

    assert isinstance(
        _create_db_interface(
            password="dropapp_root",
            host="127.0.0.1",
            port=32000,
            user="root",
            database="dropapp_dev",
        ),
        peewee.MySQLDatabase,
    )


def test_import_products(
    valid_data_filepath,
    valid_data,
    empty_filepath,
    only_header_filepath,
    invalid_data_filepath,
    invalid_typed_data_filepath,
):
    import_products(data_filepath=valid_data_filepath)
    products = list(Product.select().dicts())

    # Verify that result is superset of original test data
    assert products[-2].items() >= valid_data[0].items()
    assert products[-1].items() >= valid_data[1].items()

    with pytest.raises(RuntimeError):
        import_products(data_filepath=empty_filepath)

    with pytest.raises(RuntimeError):
        import_products(data_filepath=only_header_filepath)

    with pytest.raises(ValueError):
        import_products(data_filepath=invalid_data_filepath)

    with pytest.raises(ValueError) as exc_info:
        import_products(data_filepath=invalid_typed_data_filepath)
    assert exc_info.value.args[0] == "Invalid fields:\nRow   1: category"


def test_clone_products(default_product):
    target_base_id = 2
    clone_products(source_base_id=1, target_base_id=target_base_id)

    # Verify that source and target product are identical apart from ID, base, and price
    products = list(Product.select().dicts())
    cloned_products = products[-2:]
    original_products = products[:1]
    for cloned_product, original_product in zip(cloned_products, original_products):
        cloned_product.pop("id")
        cloned_product.pop("created_by")
        for field in ["id", "base", "price", "created_by"]:
            original_product.pop(field)
        assert cloned_product.pop("base") == target_base_id
        assert cloned_product.pop("price") == 0
        assert cloned_product == original_product

    with pytest.raises(ValueError):
        clone_products(source_base_id=0, target_base_id=1)
    with pytest.raises(ValueError):
        clone_products(source_base_id=1, target_base_id=0)


@pytest.fixture
def usergroup_data():
    # Set up three usergroups for base 1 (run by org 1 which also runs base 2)
    db.database.execute_sql(
        """\
DROP TABLE IF EXISTS `cms_usergroups`;
"""
    )
    db.database.execute_sql(
        """\
CREATE TABLE `cms_usergroups` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(255) NOT NULL,
  `created` datetime DEFAULT NULL,
  `created_by` int(11) unsigned DEFAULT NULL,
  `modified` datetime DEFAULT NULL,
  `modified_by` int(11) unsigned DEFAULT NULL,
  `organisation_id` int(11) unsigned NOT NULL,
  `deleted` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `organisation_id` (`organisation_id`),
  KEY `created_by` (`created_by`),
  KEY `modified_by` (`modified_by`),
  CONSTRAINT `cms_usergroups_ibfk_1` FOREIGN KEY (`organisation_id`)
  REFERENCES `organisations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_ibfk_3` FOREIGN KEY (`created_by`)
  REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_ibfk_4` FOREIGN KEY (`modified_by`)
  REFERENCES `cms_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
"""
    )

    db.database.execute_sql(
        """\
INSERT INTO `cms_usergroups` VALUES
    (1,'Head of Operations',NULL,NULL,NULL,NULL,1,NULL),
    (2,'Base 1 - Coordinator',NULL,NULL,NULL,NULL,1,NULL),
    (3,'Base 1 - Warehouse Volunteer',NULL,NULL,NULL,NULL,1,NULL),
    (4,'Base 1 - Freeshop Volunteer',NULL,NULL,NULL,NULL,1,NULL),
    (5,'Base 1 - Library Volunteer',NULL,NULL,NULL,NULL,1,NULL);
"""
    )

    db.database.execute_sql(
        """\
DROP TABLE IF EXISTS `cms_usergroups_camps`;
"""
    )
    db.database.execute_sql(
        """\
CREATE TABLE `cms_usergroups_camps` (
  `camp_id` int(11) unsigned NOT NULL,
  `cms_usergroups_id` int(11) unsigned NOT NULL,
  UNIQUE KEY `usergroups_camps_unique` (`camp_id`,`cms_usergroups_id`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  KEY `camp_id` (`camp_id`),
  CONSTRAINT `cms_usergroups_camps_ibfk_1` FOREIGN KEY (`cms_usergroups_id`)
  REFERENCES `cms_usergroups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cms_usergroups_camps_ibfk_2` FOREIGN KEY (`camp_id`)
  REFERENCES `camps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;
"""
    )

    db.database.execute_sql(
        """\
INSERT INTO `cms_usergroups_camps` VALUES
    (1,1),
    (1,2),
    (1,3),
    (1,4),
    (1,5),
    (2,1);
"""
    )

    db.database.execute_sql(
        """\
DROP TABLE IF EXISTS `cms_usergroups_roles`;
"""
    )
    db.database.execute_sql(
        """\
CREATE TABLE `cms_usergroups_roles` (
  `cms_usergroups_id` int(11) unsigned NOT NULL,
  `auth0_role_id` varchar(255) NOT NULL,
  `auth0_role_name` varchar(255) NOT NULL,
  UNIQUE KEY `cms_usergroups_id_2` (`cms_usergroups_id`,`auth0_role_id`),
  KEY `cms_usergroups_id` (`cms_usergroups_id`),
  CONSTRAINT `cms_usergroups_roles_ibfk_1` FOREIGN KEY (`cms_usergroups_id`)
  REFERENCES `cms_usergroups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
"""
    )

    db.database.execute_sql(
        """\
INSERT INTO `cms_usergroups_roles` VALUES
    (1,%s,'administrator'),
    (2,'rol_b','base_1_coordinator'),
    (3,'rol_c','base_1_warehouse_volunteer'),
    (4,'rol_d','base_1_free_shop_volunteer'),
    (5,'rol_e','base_1_library_volunteer');
""",
        (AUTH0_ADMIN_ROLE_ID,),
    )

    yield

    # drop tables after test has run; otherwise in model_tests.conftest the referenced
    # camps and organisations tables can't be dropped
    for table in ["cms_usergroups_roles", "cms_usergroups_camps", "cms_usergroups"]:
        db.database.execute_sql(f"DROP TABLE {table};")


def test_remove_base_access_functions(usergroup_data):
    base_id = 1
    assert _get_admin_usergroup_id(base_id, AUTH0_ADMIN_ROLE_ID) == 1
    non_admin_usergroup_ids = [2, 3, 4, 5]
    assert (
        _get_non_admin_usergroup_ids(base_id, AUTH0_ADMIN_ROLE_ID)
        == non_admin_usergroup_ids
    )
    assert _get_non_admin_user_ids(non_admin_usergroup_ids) == [1, 2, 8]
    assert _get_non_admin_role_ids(non_admin_usergroup_ids) == [
        f"rol_{x}" for x in "bcde"
    ]

    user_id = 1
    users = [Struct({"user_id": user_id, "app_metadata": {}})]
    assert _user_data_without_base_id(users, base_id) == {}

    base_id = "1"
    users = [Struct({"user_id": user_id, "app_metadata": {"base_ids": [base_id]}})]
    assert _user_data_without_base_id(users, base_id) == {
        user_id: {"app_metadata": {"base_ids": []}}
    }

    another_base_id = "2"
    base_ids = [base_id, another_base_id]
    users = [Struct({"user_id": user_id, "app_metadata": {"base_ids": base_ids}})]
    assert _user_data_without_base_id(users, base_id) == {
        user_id: {"app_metadata": {"base_ids": [another_base_id]}}
    }

    non_present_base_id = "0"
    assert _user_data_without_base_id(users, non_present_base_id) == {}


class Service(Auth0Service):
    def __init__(self):
        self._interface = MagicMock()
        self._interface.users = MagicMock()
        self._interface.roles = MagicMock()
        self._interface.users.list.return_value = {
            "users": [
                {"app_metadata": {"base_ids": [1, 2]}, "user_id": 1, "name": "admin"},
            ]
        }


def test_remove_base_access(usergroup_data):
    admin_usergroup_id = 1
    base_id = 1
    service = Service()
    remove_base_access(base_id=base_id, service=service)

    # Verify that User._usergroup field is set to NULL
    assert User.select(User.id, User._usergroup).dicts() == [
        {"id": 1, "_usergroup": None},
        {"id": 2, "_usergroup": None},
        {"id": 3, "_usergroup": None},
        {"id": 8, "_usergroup": None},
    ]

    # Verify that cms_usergroups.deleted is set
    cursor = db.database.execute_sql("SELECT id,deleted FROM cms_usergroups;")
    column_names = [x[0] for x in cursor.description]
    usergroups = [dict(zip(column_names, row)) for row in cursor.fetchall()]
    assert usergroups[0] == {"id": admin_usergroup_id, "deleted": None}
    today = date.today().isoformat()
    for i, usergroup in enumerate(usergroups[1:], start=2):
        assert usergroup["id"] == i
        assert usergroup["deleted"].isoformat().startswith(today)

    # Verify that all entries related to base 1 are removed from cms_usergroups_camps
    cursor = db.database.execute_sql(
        "SELECT camp_id,cms_usergroups_id from cms_usergroups_camps;"
    )
    assert cursor.fetchall() == ((2, admin_usergroup_id),)

    # Verify that all entries related to non-admin usergroups are removed from
    # cms_usergroups_roles
    cursor = db.database.execute_sql(
        "SELECT cms_usergroups_id,auth0_role_name from cms_usergroups_roles;"
    )
    assert cursor.fetchall() == ((admin_usergroup_id, "administrator"),)

    interface = service._interface
    interface.users.list.assert_called_once()
    interface.users.update.assert_called_once()
    assert interface.roles.delete.call_count == 4