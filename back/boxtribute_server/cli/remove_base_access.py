from boxtribute_server.db import db

from .utils import setup_logger

LOGGER = setup_logger(__name__)


def remove_base_access(*, base_id, service, force):
    users = service.get_users_of_base(base_id)
    single_base_user_role_ids = service.get_single_base_user_role_ids(base_id)
    cursor = db.database.execute_sql(
        """\
SELECT cuc1.cms_usergroups_id
FROM cms_usergroups_camps cuc1
WHERE cuc1.cms_usergroups_id IN (
            SELECT cuc2.cms_usergroups_id
            FROM cms_usergroups_camps cuc2
            WHERE cuc2.camp_id = %s
)
GROUP BY cuc1.cms_usergroups_id
HAVING count(*) = 1
;""",
        (int(base_id),),
    )
    single_base_user_group_ids = [row[0] for row in cursor.fetchall()]

    with db.database.atomic():
        _show_affected_database_entries(
            base_id=base_id,
            single_base_users=users["single_base"],
            single_base_user_role_ids=single_base_user_role_ids,
            single_base_user_group_ids=single_base_user_group_ids,
        )
        _show_affected_user_management_entries(
            single_base_user_role_ids=single_base_user_role_ids,
            users=users,
        )
        if not force:
            LOGGER.warning(
                "The command did not make any effective changes. Use the "
                "--force option to update database and Auth0."
            )
            return

        _update_user_data_in_database(
            base_id=base_id,
            single_base_users=users["single_base"],
            single_base_user_role_ids=single_base_user_role_ids,
            single_base_user_group_ids=single_base_user_group_ids,
        )
        _update_user_data_in_user_management_service(
            service,
            users=users,
            base_id=base_id,
            single_base_user_role_ids=single_base_user_role_ids,
        )


def _show_affected_database_entries(
    *, base_id, single_base_users, single_base_user_role_ids, single_base_user_group_ids
):
    cursor = db.database.execute_sql(
        """\
SELECT count(c.id) FROM camps c
WHERE organisation_id = (SELECT organisation_id FROM camps WHERE id = %s)
AND (c.deleted IS NULL OR NOT c.deleted)
;""",
        (base_id,),
    )
    result = cursor.fetchall()
    nr_active_bases = result[0][0]
    if nr_active_bases == 1:
        LOGGER.info("The governing organisation will be soft-deleted.")

    LOGGER.info(f"Nr of single base usergroups: {len(single_base_user_group_ids)}")
    LOGGER.info(single_base_user_group_ids)

    cursor = db.database.execute_sql(
        """SELECT * FROM cms_usergroups_camps cuc WHERE cuc.camp_id = %s;""",
        (int(base_id),),
    )
    result = cursor.fetchall()
    LOGGER.info(f"Nr of rows to be deleted from cms_usergroups_camps: {len(result)}")
    LOGGER.info(result)

    cursor = db.database.execute_sql(
        """SELECT * FROM cms_functions_camps cfc WHERE cfc.camps_id = %s;""",
        (int(base_id),),
    )
    result = cursor.fetchall()
    LOGGER.info(f"Nr of rows to be deleted from cms_functions_camps: {len(result)}")
    LOGGER.info(result)

    if single_base_user_role_ids:
        cursor = db.database.execute_sql(
            """SELECT * FROM cms_usergroups_roles WHERE auth0_role_id IN %s;""",
            (single_base_user_role_ids,),
        )
        result = cursor.fetchall()

    if not single_base_users:
        LOGGER.info(
            f"Nr of rows to be deleted from cms_usergroups_roles: {len(result)}"
        )
        LOGGER.info(result)

    single_base_user_ids = [
        int(u["user_id"].lstrip("auth0|")) for u in single_base_users
    ]

    if single_base_user_ids:
        cursor = db.database.execute_sql(
            """\
SELECT * FROM cms_usergroups_roles cur
WHERE cms_usergroups_id IN (
    SELECT DISTINCT u.cms_usergroups_id FROM cms_users u
    WHERE u.id IN %s
)
;""",
            (single_base_user_ids,),
        )
        result = set(result).union(set(cursor.fetchall()))
        LOGGER.info(
            f"Nr of rows to be deleted from cms_usergroups_roles: {len(result)}"
        )
        LOGGER.info(result)

        cursor = db.database.execute_sql(
            """\
SELECT u.naam FROM cms_users u
WHERE u.id in %s
;""",
            (single_base_user_ids,),
        )
        result = cursor.fetchall()
        LOGGER.info(f"Nr of rows to be soft-deleted in cms_users: {len(result)}")
        LOGGER.info(", ".join([row[0] for row in result]))

    if not single_base_user_group_ids:
        return

    cursor = db.database.execute_sql(
        """\
SELECT * FROM cms_usergroups_functions cuf
WHERE cms_usergroups_id IN %s
;""",
        (single_base_user_group_ids,),
    )
    result = cursor.fetchall()
    LOGGER.info(
        f"Nr of rows to be deleted from cms_usergroups_functions: {len(result)}"
    )
    LOGGER.info(result)


def _show_affected_user_management_entries(*, single_base_user_role_ids, users):
    LOGGER.info(f"Nr of Auth0 roles to be deleted: {len(single_base_user_role_ids)}")
    LOGGER.info(
        f"Nr of Auth0 multi-base users to be updated: {len(users['multi_base'])}"
    )
    LOGGER.info(
        f"Nr of Auth0 single-base users to be blocked: {len(users['single_base'])}"
    )


def _update_user_data_in_database(
    *, base_id, single_base_users, single_base_user_role_ids, single_base_user_group_ids
):
    # !!!
    # Destructive operations below
    # !!!
    # Operations on cms_usergroups_camps/cms_usergroups_roles tables affect both multi-
    # and single base users.

    # Note: using execute_sql() instead of peewee model operations helps to avoid
    # "Cannot use uninitialized Proxy" (which could be circumvented by hackily moving
    # model imports inside this function)

    db.database.execute_sql(
        """UPDATE camps SET deleted = UTC_TIMESTAMP() WHERE id = %s;""",
        (int(base_id),),
    )

    # Soft-delete governing organisation if no active bases left
    db.database.execute_sql(
        """\
UPDATE organisations o
LEFT JOIN camps c ON c.organisation_id = o.id
SET o.deleted = UTC_TIMESTAMP()
WHERE o.id = (
SELECT organisation_id
FROM camps
WHERE id = %s
)
AND (
SELECT COUNT(*)
FROM camps c2
WHERE c2.organisation_id = o.id
AND (c2.deleted IS NULL OR NOT c2.deleted)
) = 0
;""",
        (int(base_id),),
    )

    # Remove rows with base ID from cms_usergroups_camps table
    db.database.execute_sql(
        """DELETE cuc FROM cms_usergroups_camps cuc WHERE cuc.camp_id = %s;""",
        (int(base_id),),
    )
    # Remove rows with base ID from cms_functions_camps table
    db.database.execute_sql(
        """DELETE cfc FROM cms_functions_camps cfc WHERE cfc.camps_id = %s;""",
        (int(base_id),),
    )

    if single_base_user_role_ids:
        # Remove rows with single-base role IDs from cms_usergroups_roles table
        db.database.execute_sql(
            """DELETE FROM cms_usergroups_roles WHERE auth0_role_id IN %s;""",
            (single_base_user_role_ids,),
        )

    single_base_user_ids = [
        int(u["user_id"].lstrip("auth0|")) for u in single_base_users
    ]

    # Remove rows with usergroups of users with single base in their app_metadata from
    # cms_usergroups_roles table. This is required in addition to the above operation in
    # the same table since above only rows containing roles with a `base_x` prefix are
    # deleted, but here also rows of users with single-base access and a role like
    # `administrator` (without base_X prefix) are removed
    if single_base_user_ids:
        db.database.execute_sql(
            """\
DELETE FROM cms_usergroups_roles cur
WHERE cms_usergroups_id IN (
    SELECT DISTINCT u.cms_usergroups_id FROM cms_users u
    WHERE u.id IN %s
)
;""",
            (single_base_user_ids,),
        )

    if single_base_user_group_ids:
        db.database.execute_sql(
            """\
DELETE FROM cms_usergroups_functions cuf
WHERE cms_usergroups_id IN %s
;""",
            (single_base_user_group_ids,),
        )

        # Operations on cms_usergroups/cms_users tables affect only single-base users

        # Soft-delete the single-base usergroups from the cms_usergroups table.
        # Must execute this before setting cms_users.cms_usergroups_id to NULL
        db.database.execute_sql(
            """\
UPDATE cms_usergroups cu
SET cu.deleted = UTC_TIMESTAMP()
WHERE cu.id IN %s
;""",
            (single_base_user_group_ids,),
        )

    if not single_base_user_ids:
        return

    # Soft-delete single-base users (reset FK references and anonymize)
    db.database.execute_sql(
        """\
UPDATE cms_users u
SET u.cms_usergroups_id = NULL,
    u.deleted = UTC_TIMESTAMP(),
    u.naam = "Deleted user",
    u.is_admin = 0,
    u.pass = "Deleted password",
    u.created = NULL,
    u.created_by = NULL,
    u.modified = NULL,
    u.modified_by = NULL,
    u.resetpassword = NULL,
    u.language = NULL,
    u.valid_firstday = NULL,
    u.valid_firstday = NULL,
    u.lastlogin = "1970-01-01",
    u.lastaction = "1970-01-01",
    u.email = NULL
WHERE u.id in %s
;""",
        (single_base_user_ids,),
    )


def _update_user_data_in_user_management_service(
    service, *, users, base_id, single_base_user_role_ids
):
    service.remove_base_id_from_multi_base_users_metadata(
        users=users["multi_base"], base_id=base_id
    )
    service.block_single_base_users(users["single_base"])
    service.remove_roles(single_base_user_role_ids)
