from boxtribute_server.db import db

from .utils import setup_logger

LOGGER = setup_logger(__name__)

AUTH0_ADMIN_ROLE_ID = "rol_tP8t9gMxhO1Odtdw"  # dev


def _get_admin_usergroup_id(base_id, admin_role_id):
    cursor = db.database.execute_sql(
        """\
SELECT cu.id FROM cms_usergroups cu
JOIN cms_usergroups_roles cur
ON cur.cms_usergroups_id = cu.id
AND cur.auth0_role_id = %s
JOIN cms_usergroups_camps cuc
ON cuc.cms_usergroups_id = cu.id
AND cuc.camp_id = %s;""",
        (admin_role_id, base_id),
    )
    try:
        return cursor.fetchall()[0][0]
    except IndexError:
        # No admin usergroup registered for base
        return


def _get_non_admin_usergroup_ids(base_id, admin_role_id):
    cursor = db.database.execute_sql(
        """\
SELECT DISTINCT cu.id FROM cms_usergroups cu
JOIN cms_usergroups_roles cur
ON cur.cms_usergroups_id = cu.id
AND cur.auth0_role_id <> %s
JOIN cms_usergroups_camps cuc
ON cuc.cms_usergroups_id = cu.id
AND cuc.camp_id = %s;""",
        (admin_role_id, base_id),
    )
    return [row[0] for row in cursor.fetchall()]


def _get_non_admin_user_ids(base_id, non_admin_usergroup_ids):
    if not non_admin_usergroup_ids:
        return []
    cursor = db.database.execute_sql(
        """\
SELECT cu.id FROM cms_users cu
INNER JOIN cms_usergroups_camps cuc
ON cu.cms_usergroups_id = cuc.cms_usergroups_id
AND cuc.camp_id = %s
AND cu.cms_usergroups_id IN %s;""",
        (base_id, non_admin_usergroup_ids),
    )
    return [row[0] for row in cursor.fetchall()]


def _get_non_admin_role_ids(base_id, non_admin_usergroup_ids):
    if not non_admin_usergroup_ids:
        return []
    cursor = db.database.execute_sql(
        """\
SELECT DISTINCT auth0_role_id FROM cms_usergroups_roles cur
INNER JOIN cms_usergroups_camps cuc
ON cur.cms_usergroups_id = cuc.cms_usergroups_id
AND cuc.camp_id = %s
AND cur.cms_usergroups_id IN %s;""",
        (base_id, non_admin_usergroup_ids),
    )
    return [row[0] for row in cursor.fetchall()]


def remove_base_access(*, base_id, service):
    with db.database.atomic():
        admin_usergroup_id, non_admin_role_ids = _update_database(base_id)
        _update_user_management_service(
            service, admin_usergroup_id, base_id, non_admin_role_ids
        )


def _update_database(base_id):
    # users who are part of the coordinator and volunteer usergroups connected to this
    # base
    admin_usergroup_id = _get_admin_usergroup_id(base_id, AUTH0_ADMIN_ROLE_ID)
    non_admin_usergroup_ids = _get_non_admin_usergroup_ids(base_id, AUTH0_ADMIN_ROLE_ID)
    non_admin_user_ids = _get_non_admin_user_ids(base_id, non_admin_usergroup_ids)
    non_admin_role_ids = _get_non_admin_role_ids(base_id, non_admin_usergroup_ids)

    # !!!
    # Destructive operations below
    # !!!
    # Remove rows with base ID from cms_usergroups_camps table
    db.database.execute_sql(
        """DELETE cuc FROM cms_usergroups_camps cuc WHERE cuc.camp_id = %s;""",
        (base_id,),
    )

    # Set _usergroup to NULL for non-admin users
    from boxtribute_server.models.definitions.user import User

    # also set deleted?
    User.update(_usergroup=None).where(User.id << non_admin_user_ids).execute()

    if not non_admin_role_ids:
        return admin_usergroup_id, []

    # soft-delete the coordinator and volunteer usergroups from the cms_usergroups table
    db.database.execute_sql(
        """UPDATE cms_usergroups SET deleted = UTC_TIMESTAMP() WHERE id IN %s;""",
        (non_admin_usergroup_ids,),
    )

    # Remove rows with non-admin usergroup IDs from cms_usergroups_roles table
    db.database.execute_sql(
        """DELETE FROM cms_usergroups_roles WHERE cms_usergroups_id IN %s;""",
        (non_admin_usergroup_ids,),
    )

    return admin_usergroup_id, non_admin_role_ids


def _update_user_management_service(
    service, admin_usergroup_id, base_id, non_admin_role_ids
):
    users = service.get_admin_users(admin_usergroup_id)

    service.update_admin_users(users=users, base_id=base_id)

    service.remove_non_admin_roles(non_admin_role_ids)
