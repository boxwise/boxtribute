import logging
import os
import time
from datetime import date
from unittest.mock import patch

import pytest
from auth0.exceptions import Auth0Error
from boxtribute_server.cli.main import main as cli_main
from boxtribute_server.db import db
from boxtribute_server.models.definitions.base import Base
from boxtribute_server.models.definitions.user import User

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)

# time to wait for Auth0 database to index updated data fields
WAIT = 5


@pytest.fixture
def auth0_roles(auth0_management_api_client):
    # Set up test roles in Auth0
    interface = auth0_management_api_client._interface
    roles_data = [
        {"name": "administrator-TEST", "description": "Org 1 Head of Operations"},
        {"name": "base_8_coordinator-TEST", "description": "Base 8 coordinator"},
        {"name": "base_8_volunteer-TEST", "description": "Base 8 volunteer"},
        {"name": "base_9_volunteer-TEST", "description": "Base 9 volunteer"},
        {"name": "base_80_volunteer-TEST", "description": "Base 80 volunteer"},
    ]
    roles = {}
    for role_data in roles_data:
        response = interface.roles.create(role_data)
        roles[role_data["name"]] = response
        logger.info(f"Created role {response['id']}")

    # Return dict[role_name] -> {id, name, description}
    yield roles

    # Tear-down; ignore Not-Found errors for already deleted roles
    for role in roles.values():
        role_id = role["id"]
        logger.info(f"Deleting role {role_id}")
        try:
            interface.roles.delete(role_id)
        except Auth0Error as e:
            if e.status_code != 404:
                raise e


@pytest.fixture
def auth0_users(auth0_management_api_client, auth0_roles):
    # Set up test users in Auth0 and assign roles to them
    interface = auth0_management_api_client._interface
    users_data = [
        # administrator
        {
            "user_id": "9999990",
            "app_metadata": {"base_ids": ["8", "9"]},
            "email": "a@test.com",
        },
        # coordinator
        {
            "user_id": "9999991",
            "app_metadata": {"base_ids": ["8"]},
            "email": "b@test.com",
        },
        # volunteers
        {
            "user_id": "9999992",
            "app_metadata": {"base_ids": ["8"]},
            "email": "c@test.com",
        },
        {
            "user_id": "9999993",
            "app_metadata": {"base_ids": ["8"]},
            "email": "d@test.com",
        },
        {
            "user_id": "9999994",
            "app_metadata": {"base_ids": ["9"]},
            "email": "e@test.com",
        },
    ]

    def user_id(index):
        """Conversion of user ID from MySQL database format into Auth0 format."""
        return f"auth0|{users_data[index]['user_id']}"

    for user_data in users_data:
        user_data["connection"] = "Username-Password-Authentication"
        user_data["password"] = "Browser_tests"
        user_data["blocked"] = False
        response = interface.users.create(user_data)
        logger.info(f"Created user {response['user_id']}")
    interface.roles.add_users(
        auth0_roles["administrator-TEST"]["id"],
        [user_id(0)],
    )
    interface.roles.add_users(
        auth0_roles["base_8_coordinator-TEST"]["id"],
        [user_id(0)],
    )
    interface.roles.add_users(
        auth0_roles["base_8_coordinator-TEST"]["id"],
        [user_id(1)],
    )
    interface.roles.add_users(
        auth0_roles["base_8_volunteer-TEST"]["id"],
        [user_id(2), user_id(3)],
    )
    interface.roles.add_users(
        auth0_roles["base_9_volunteer-TEST"]["id"],
        [user_id(4)],
    )

    time.sleep(WAIT)

    # Return list
    yield users_data

    for i in range(len(users_data)):
        logger.info(f"Deleting user {user_id(i)}")
        interface.users.delete(user_id(i))


@pytest.fixture
def mysql_data(auth0_roles, auth0_users):
    # Set up test bases, users, and cms_usergroups* data in MySQL
    base8 = Base.create(id=8, name="Eighth Base", organisation=1, seq=1)
    base9 = Base.create(id=9, name="Ninth Base", organisation=1, seq=1)

    labels = tuple(r["description"] for r in auth0_roles.values())
    db.database.execute_sql(
        """\
INSERT INTO cms_usergroups
    (id, label, organisation_id, userlevel, allow_borrow_adddelete)
VALUES
    (99999990, %s, 1, 1, 0),
    (99999991, %s, 1, 1, 0),
    (99999992, %s, 1, 1, 0),
    (99999993, %s, 1, 1, 0),
    (99999994, %s, 1, 1, 0)
;""",
        labels,
    )

    db.database.execute_sql(
        """\
INSERT INTO cms_usergroups_camps
    (camp_id, cms_usergroups_id)
VALUES
    (8, 99999990),
    (8, 99999991),
    (8, 99999992),
    (9, 99999993),
    (9, 99999990)
;"""
    )

    data = [
        auth0_roles["base_8_coordinator-TEST"]["id"],
        "base_8_coordinator-TEST",
    ]
    for role_name, role in auth0_roles.items():
        data.append(role["id"])
        data.append(role_name)
    db.database.execute_sql(
        """\
INSERT INTO cms_usergroups_roles
    (auth0_role_id, auth0_role_name, cms_usergroups_id)
VALUES
    (%s, %s, 99999990),
    (%s, %s, 99999990),
    (%s, %s, 99999991),
    (%s, %s, 99999992),
    (%s, %s, 99999993),
    (%s, %s, 99999994)
;""",
        data,
    )

    usergroups = [99999990, 99999991, 99999992, 99999992, 99999993]
    data = []
    for user, group in zip(auth0_users, usergroups):
        data.append(int(user["user_id"]))
        data.append(user["password"])
        data.append(user["email"][0])
        data.append(user["email"])
        data.append(group)
    # Can't use User model here because the database does not accept NULL deleted dates
    # but peewee does not accept the work-around 0000 dates
    db.database.execute_sql(
        """\
INSERT INTO cms_users
    (id, pass, naam, email, cms_usergroups_id, lastlogin, lastaction, deleted)
VALUES
    (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), "0000-00-00 00:00:00"),
    (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), "0000-00-00 00:00:00"),
    (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), "0000-00-00 00:00:00"),
    (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), "0000-00-00 00:00:00"),
    (%s, %s, %s, %s, %s, UTC_TIMESTAMP(), UTC_TIMESTAMP(), "0000-00-00 00:00:00")
;""",
        data,
    )

    yield

    # Tear-down: delete everything created above
    user_ids = [int(u["user_id"]) for u in auth0_users]
    db.database.execute_sql("""DELETE FROM cms_users WHERE id IN %s;""", (user_ids,))
    db.database.execute_sql(
        """\
DELETE FROM cms_usergroups_roles WHERE auth0_role_name LIKE "%%-TEST";"""
    )
    db.database.execute_sql(
        """\
DELETE FROM cms_usergroups_camps
WHERE cms_usergroups_id BETWEEN 99999990 AND 99999994;"""
    )
    db.database.execute_sql(
        """\
DELETE FROM cms_usergroups WHERE id BETWEEN 99999990 AND 99999994;"""
    )
    base8.delete_instance()
    base9.delete_instance()


# Patch interactive confirmation input; must be first argument for test function
@patch("builtins.input", return_value="YES")
def test_remove_base_access(patched_input, mysql_data, auth0_management_api_client):
    base_id = "8"
    cli_main(
        [
            "--host",
            os.environ["MYSQL_HOST"],
            "--port",
            os.environ["MYSQL_PORT"],
            "--user",
            os.environ["MYSQL_USER"],
            "--database",
            os.environ["MYSQL_DB"],
            "--password",
            os.environ["MYSQL_PASSWORD"],
            "remove-base-access",
            "--base-id",
            base_id,
        ]
    )

    time.sleep(WAIT)

    # Verify that no users have base ID 8 in their app_metadata any more
    users = auth0_management_api_client.get_users_of_base(base_id)
    assert users == {"single_base": [], "multi_base": []}
    # Verify that two users still have access to base ID 9
    base_id = "9"
    users = auth0_management_api_client.get_users_of_base(base_id)
    assert users == {
        "single_base": [
            {
                "app_metadata": {"base_ids": [base_id]},
                "name": "a@test.com",
                "user_id": "auth0|9999990",
            },
            {
                "app_metadata": {"base_ids": [base_id]},
                "name": "e@test.com",
                "user_id": "auth0|9999994",
            },
        ],
        "multi_base": [],
    }
    role_ids = auth0_management_api_client.get_single_base_user_role_ids(base_id)
    assert len(role_ids) == 1
    role_ids = auth0_management_api_client.get_single_base_user_role_ids(80)
    assert len(role_ids) == 1

    # Verify that User._usergroup field is set to NULL and User data is anonymized
    fields = {
        "created": None,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "language": None,
        "is_admin": 0,
        "valid_first_day": None,
        "valid_last_day": None,
    }
    users = list(
        User.select(
            User.id,
            User._usergroup,
            User.name,
            User.email,
            User.created,
            User.created_by,
            User.modified,
            User.modified_by,
            User.language,
            User.is_admin,
            User._password,
            User.valid_first_day,
            User.valid_last_day,
        )
        .where(User.id.between(9999990, 9999994))
        .dicts()
    )
    assert users == [
        {
            **fields,
            "id": 9999990,
            "_usergroup": 99999990,
            "name": "a",
            "email": "a@test.com",
            "_password": "Browser_tests",
        },
        {
            **fields,
            "id": 9999991,
            "_usergroup": None,
            "name": "Deleted user",
            "email": None,
            "_password": "Deleted password",
        },
        {
            **fields,
            "id": 9999992,
            "_usergroup": None,
            "name": "Deleted user",
            "email": None,
            "_password": "Deleted password",
        },
        {
            **fields,
            "id": 9999993,
            "_usergroup": None,
            "name": "Deleted user",
            "email": None,
            "_password": "Deleted password",
        },
        {
            **fields,
            "id": 9999994,
            "_usergroup": 99999993,
            "name": "e",
            "email": "e@test.com",
            "_password": "Browser_tests",
        },
    ]

    today = date.today().isoformat()
    cursor = db.database.execute_sql(
        """\
SELECT id, deleted FROM cms_usergroups WHERE id BETWEEN 99999990 AND 99999994;"""
    )
    data = cursor.fetchall()
    assert data[0] == (99999990, None)
    assert data[1][0] == 99999991
    assert data[1][1].isoformat().startswith(today)
    assert data[2][0] == 99999992
    assert data[2][1].isoformat().startswith(today)
    assert data[3] == (99999993, None)
    assert data[4] == (99999994, None)

    cursor = db.database.execute_sql(
        """\
SELECT camp_id, cms_usergroups_id FROM cms_usergroups_camps
WHERE cms_usergroups_id BETWEEN 99999990 AND 99999994;"""
    )
    data = cursor.fetchall()
    assert data == ((9, 99999990), (9, 99999993))

    cursor = db.database.execute_sql(
        """\
SELECT auth0_role_name, cms_usergroups_id FROM cms_usergroups_roles
WHERE cms_usergroups_id BETWEEN 99999990 AND 99999994;"""
    )
    data = cursor.fetchall()
    assert data == (
        ("administrator-TEST", 99999990),
        ("base_9_volunteer-TEST", 99999993),
        ("base_80_volunteer-TEST", 99999994),
    )
