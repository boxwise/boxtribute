from boxtribute_server.db import db

from .utils import setup_logger

LOGGER = setup_logger(__name__)


def remove_base_access(*, base_id, service):
    users = service.get_users_of_base(base_id)
    single_base_user_role_ids = service.get_single_base_user_role_ids(
        users["single_base"]
    )

    with db.database.atomic():
        _update_user_data_in_database(
            base_id=base_id,
            single_base_user_role_ids=single_base_user_role_ids,
        )
        _update_user_data_in_user_management_service(
            service,
            users=users,
            base_id=base_id,
            single_base_user_role_ids=single_base_user_role_ids,
        )


def _update_user_data_in_database(*, base_id, single_base_user_role_ids):
    # !!!
    # Destructive operations below
    # !!!
    # Remove rows with base ID from cms_usergroups_camps table
    db.database.execute_sql(
        """DELETE cuc FROM cms_usergroups_camps cuc WHERE cuc.camp_id = %s;""",
        (int(base_id),),
    )

    if not single_base_user_role_ids:
        return

    # Soft-delete single-base users (remove usergroup and anonymize)
    db.database.execute_sql(
        """\
UPDATE cms_users u
INNER JOIN cms_usergroups_roles cur
ON u.cms_usergroups_id = cur.cms_usergroups_id
AND cur.auth0_role_id in %s
SET u.cms_usergroups_id = NULL,
    u.deleted = UTC_TIMESTAMP(),
    u.naam = "Deleted user",
    u.email = NULL
;""",
        (single_base_user_role_ids,),
    )

    # Soft-delete the single-base usergroups from the cms_usergroups table
    db.database.execute_sql(
        """\
UPDATE cms_usergroups cu
INNER JOIN cms_usergroups_roles cur
ON cu.id = cur.cms_usergroups_id
AND cur.auth0_role_id in %s
SET cu.deleted = UTC_TIMESTAMP()
;""",
        (single_base_user_role_ids,),
    )

    # Remove rows with single-base role IDs from cms_usergroups_roles table
    db.database.execute_sql(
        """DELETE FROM cms_usergroups_roles WHERE auth0_role_id IN %s;""",
        (single_base_user_role_ids,),
    )


def _update_user_data_in_user_management_service(
    service, *, users, base_id, single_base_user_role_ids
):
    service.remove_base_id_from_multi_base_users_metadata(
        users=users["multi_base"], base_id=base_id
    )
    service.block_single_base_users(users["single_base"])
    service.remove_roles(single_base_user_role_ids)
