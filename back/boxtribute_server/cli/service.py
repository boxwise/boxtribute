from auth0 import Auth0Error
from auth0.authentication import GetToken
from auth0.management import Auth0

from ..exceptions import ServiceError
from .utils import setup_logger

LOGGER = setup_logger(__name__)


class Auth0Service:
    def __init__(self, interface):
        self._interface = interface

    def get_users_of_base(self, base_id):
        """Fetch all users of the given base. Return lists of users sorted by
        single-base/multi-base type.
        """
        base_id = str(base_id)
        # https://github.com/auth0/auth0-python/blob/6b1199fc74a8d2fc6655ffeef09ae961dc0b8c37/auth0/management/users.py#L55
        users = []
        try:
            # Pagination setup
            page = 0
            per_page = 50
            rest = None
            while True:
                response = self._interface.users.list(
                    q=f'app_metadata.base_ids:"{base_id}" AND blocked:false',
                    fields=["app_metadata", "user_id", "name"],
                    page=page,
                    per_page=per_page,
                )
                LOGGER.info(
                    f"Fetched page {page + 1} of user data of total {response['total']}"
                    " users."
                )
                if rest is None:
                    rest = response["total"]
                users.extend(response["users"])

                # Pagination logic: go to next page; stop if nothing left
                page += 1
                rest -= per_page
                if rest < 1:
                    break
        except Auth0Error as e:
            raise ServiceError(code=e.status_code, message=e.message)

        # Sort response into single- and multi-base users
        result = {"single_base": [], "multi_base": []}
        for user in users:
            metadata = user["app_metadata"]
            base_ids = metadata.get("base_ids")
            if base_id not in base_ids:
                LOGGER.warn(
                    f"Base ID {base_id} not present in metadata base IDs: "
                    f"{', '.join(base_ids)}"
                )
                continue
            if len(base_ids) == 1:
                result["single_base"].append(user)
            else:
                result["multi_base"].append(user)

        return result

    def get_single_base_user_role_ids(self, users):
        errors = {}
        role_ids = set()
        for user in users:
            user_id = user["user_id"]
            try:
                response = self._interface.users.list_roles(user_id)
                role_ids.update({r["id"] for r in response["roles"]})
            except Auth0Error as e:
                errors[user_id] = e
        if errors:
            # dump and/or log
            pass
        return sorted(role_ids)

    def remove_base_id_from_multi_base_users_metadata(self, *, base_id, users):
        """Remove access to base with given ID from users."""
        updated_users = _user_data_without_base_id(users, base_id)
        errors = {}
        for user_id, data in updated_users.items():
            # https://auth0.com/docs/api/management/v2/users/patch-users-by-id
            # app_metadata field will be upserted
            try:
                self._interface.users.update(user_id, data)
            except Auth0Error as e:
                errors[user_id] = e
        if errors:
            # dump and/or log
            pass

    def block_single_base_users(self, users):
        errors = {}
        for user in users:
            user_id = user["user_id"]
            try:
                self._interface.users.update(user_id, {"blocked": True})
            except Auth0Error as e:
                errors[user_id] = e
        if errors:
            # dump and/or log
            pass

    def remove_roles(self, role_ids):
        """Remove given roles. Users with this role have it automatically unassigned."""
        errors = {}
        for role_id in role_ids:
            try:
                # https://auth0.com/docs/api/management/v2/roles/delete-roles-by-id
                self._interface.roles.delete(role_id)
            except Auth0Error as e:
                errors[role_id] = e
        if errors:
            # dump and/or log
            pass

    @classmethod
    def connect(cls, *, domain, client_id, secret):
        """Connect to Management API, following
        https://github.com/auth0/auth0-python?tab=readme-ov-file#management-sdk
        """
        LOGGER.info("Fetching Auth0 Management API token...")
        getter = GetToken(domain, client_id, client_secret=secret)
        token = getter.client_credentials(f"https://{domain}/api/v2/")["access_token"]
        interface = Auth0(domain, token)
        return cls(interface)


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
