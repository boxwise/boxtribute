from ..db import execute_sql
from .utils import setup_logger

LOGGER = setup_logger(__name__)


def clean_up_roles(*, service, force):
    """Clean up invalid (stale) Auth0 roles in the dev tenant.
    Get valid roles from the cms_usergroups_roles DB table, and all roles from the Auth0
    dev tenant. Form the difference and delete all stale roles from Auth0.
    """
    result = execute_sql(
        query="SELECT DISTINCT auth0_role_id FROM cms_usergroups_roles"
    )
    valid_role_ids = {row["auth0_role_id"] for row in result}

    auth0_roles = {role.id: role for role in service.get_roles()}
    auth0_role_ids = set(auth0_roles.keys())

    invalid_role_ids = auth0_role_ids - valid_role_ids
    if not invalid_role_ids:
        LOGGER.info("No invalid roles found.")
        return

    LOGGER.info(f"{len(invalid_role_ids)} role(s) marked for deletion")
    if not force:
        LOGGER.warning(
            "The command did not make any effective changes. Use the "
            "--force option to update Auth0."
        )
        role_names = sorted(auth0_roles[role_id].name for role_id in invalid_role_ids)
        for role_name in role_names:
            LOGGER.info(role_name)
        return

    service.remove_roles(invalid_role_ids)
