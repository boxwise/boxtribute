from boxtribute_server.db import db

from .utils import setup_logger

LOGGER = setup_logger(__name__)


def remove_base_access(*, base_id, service):
    users = service.get_users_of_base(base_id)
    single_base_user_role_ids = service.get_single_base_user_role_ids(base_id)

    with db.database.atomic():
        _update_user_data_in_database(
            base_id=base_id,
            single_base_users=users["single_base"],
            single_base_user_role_ids=single_base_user_role_ids,
        )
        _update_user_data_in_user_management_service(
            service,
            users=users,
            base_id=base_id,
            single_base_user_role_ids=single_base_user_role_ids,
        )


def _update_user_data_in_database(
    *, base_id, single_base_users, single_base_user_role_ids
):
    # !!!
    # Destructive operations below
    # !!!
    # Remove rows with base ID from cms_usergroups_camps table
    db.database.execute_sql(
        """DELETE cuc FROM cms_usergroups_camps cuc WHERE cuc.camp_id = %s;""",
        (int(base_id),),
    )

    if single_base_user_role_ids:
        # Remove rows with single-base role IDs from cms_usergroups_roles table
        db.database.execute_sql(
            """DELETE FROM cms_usergroups_roles WHERE auth0_role_id IN %s;""",
            (single_base_user_role_ids,),
        )

    if not single_base_users:
        return
    single_base_user_ids = [
        int(u["user_id"].lstrip("auth0|")) for u in single_base_users
    ]

    # Soft-delete the single-base usergroups from the cms_usergroups table.
    # Must execute this before setting cms_users.cms_usergroups_id to NULL
    db.database.execute_sql(
        """\
UPDATE cms_usergroups cu
INNER JOIN cms_users u
ON cu.id = u.cms_usergroups_id
AND u.id in %s
SET cu.deleted = UTC_TIMESTAMP()
;""",
        (single_base_user_ids,),
    )

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
