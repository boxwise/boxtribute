from auth0.management import ManagementClient
from auth0.management.core.api_error import ApiError

from ..exceptions import ServiceError
from .utils import setup_logger

LOGGER = setup_logger(__name__)


class ServiceBase:
    def __init__(self, interface):
        self._interface = interface

    def get_users(self, *, query, fields):
        """Returns user data (fields excluded from the query are returned as None)."""
        users = []
        try:
            per_page = 50
            pager = self._interface.users.list(
                q=query,
                fields=",".join(fields),
                page=0,
                per_page=per_page,
            )
            total = (
                pager.response.total if pager.response and pager.response.total else 0
            )

            # Iterate through all pages
            page_num = 0
            for page in pager.iter_pages():
                page_num += 1
                LOGGER.info(
                    f"Fetched page {page_num} of user data of total {total} users."
                )
                if page.items:
                    # Convert Pydantic models to dicts for backward compatibility
                    users.extend([user.model_dump() for user in page.items])
        except ApiError as e:
            raise ServiceError(code=e.status_code, message=e.body)
        return users

    @classmethod
    def connect(cls, *, domain, client_id, secret):
        """Connect to Management API, following
        https://github.com/auth0/auth0-python/tree/master?tab=readme-ov-file#recommended-using-managementclient
        """
        LOGGER.info("Initializing Auth0 Management API client...")
        interface = ManagementClient(
            domain=domain, client_id=client_id, client_secret=secret
        )
        return cls(interface)


class Auth0Service(ServiceBase):
    def get_users_of_base(self, base_id):
        """Fetch all users of the given base. Return lists of users sorted by
        single-base/multi-base type.
        """
        base_id = str(base_id)
        users = self.get_users(
            query=f'app_metadata.base_ids:"{base_id}"',
            fields=["app_metadata", "user_id", "name", "blocked"],
        )

        # Sort response into single- and multi-base users
        result = {"single_base": [], "multi_base": []}
        for user in users:
            metadata = user["app_metadata"]
            base_ids = metadata.get("base_ids", [])
            if base_id not in base_ids:
                LOGGER.warning(
                    f"Base ID {base_id} not present in metadata base IDs: "
                    f"{', '.join(base_ids)}"
                )
                continue
            if len(base_ids) == 1:
                result["single_base"].append(user)
            else:
                result["multi_base"].append(user)

        return result

    def get_single_base_user_role_ids(self, base_id):
        try:
            prefix = f"base_{base_id}_"
            roles = [
                role
                for role in self._interface.roles.list(per_page=100, name_filter=prefix)
            ]

            # For a prefix like 'base_1_', the API also returns roles with prefixes
            # 'base_10_', 'base_11_', etc. which need to be filtered out
            role_ids = sorted(r.id for r in roles if r.name.startswith(prefix))

            LOGGER.info(
                f"Extracted {len(role_ids)} from total of {len(roles)} roles "
                f"matching the base prefix '{prefix}'."
            )
        except ApiError as e:
            LOGGER.error(e)
            raise RuntimeError("Error while getting single base user role IDs")
        return sorted(role_ids)

    def remove_base_id_from_multi_base_users_metadata(self, *, base_id, users):
        """Remove access to base with given ID from users."""
        updated_users = _user_data_without_base_id(users, base_id)
        errors = {}
        for user_id, data in updated_users.items():
            # https://auth0.com/docs/api/management/v2/users/patch-users-by-id
            # app_metadata field will be upserted
            try:
                self._interface.users.update(id=user_id, **data)
            except ApiError as e:
                errors[user_id] = e
        if errors:
            LOGGER.error(errors)
            raise RuntimeError("Error while removing base IDs from multi-base users")

    def block_single_base_users(self, users):
        errors = {}
        for user in users:
            user_id = user["user_id"]
            try:
                self._interface.users.update(id=user_id, blocked=True)
            except ApiError as e:
                errors[user_id] = e
        if errors:
            LOGGER.error(errors)
            raise RuntimeError("Error while blocking single-base users")
        LOGGER.info(f"Blocked {len(users)} users in Auth0.")

    def remove_roles(self, role_ids):
        """Remove given roles. Users with this role have it automatically unassigned."""
        errors = {}
        for role_id in role_ids:
            try:
                # https://auth0.com/docs/api/management/v2/roles/delete-roles-by-id
                self._interface.roles.delete(role_id)
            except ApiError as e:
                # Ignore missing or deleted role
                if e.status_code != 404:
                    errors[role_id] = e
        if errors:
            LOGGER.error(errors)
            raise RuntimeError("Error while removing roles")
        LOGGER.info(f"Removed {len(role_ids)} roles in Auth0.")


def _user_data_without_base_id(users, base_id):
    """Iterate list of users and remove given base ID from their app_metadata.base_ids
    list. This is specific to the data structure in Auth0.
    Return dict of updated app_metadata for each user ID.
    """
    base_id = str(base_id)
    updated_users = {}
    for user in users:
        metadata = user["app_metadata"]

        updated_base_ids = [str(i) for i in metadata.get("base_ids", [])]
        try:
            updated_base_ids.remove(base_id)
        except ValueError:
            # An inconsistency between the database and the service happened: the user
            # should have been granted access to the base acc. to their usergroup but it
            # was not properly registered in their app_metadata
            continue
        updated_users[user["user_id"]] = {
            "app_metadata": {"base_ids": updated_base_ids}
        }
    return updated_users
