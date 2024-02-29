from auth0 import Auth0Error
from auth0.authentication import GetToken
from auth0.management import Auth0

from ..exceptions import ServiceError
from .utils import Struct


class Auth0Service:
    def __init__(self, interface):
        self._interface = interface

    def get_admin_users(self, admin_usergroup_id):
        """Fetch all users of the admin usergroup."""
        # https://github.com/auth0/auth0-python/blob/6b1199fc74a8d2fc6655ffeef09ae961dc0b8c37/auth0/management/users.py#L55
        try:
            result = Struct(
                self._interface.users.list(
                    q=f"app_metadata.usergroup_id:{admin_usergroup_id}",
                    fields=["app_metadata", "user_id", "name"],
                )
            )
            return result.users
        except Auth0Error as e:
            raise ServiceError(code=e.status_code, message=e.message)

    def update_admin_users(self, *, base_id, users):
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

    def remove_non_admin_roles(self, role_ids):
        """Remove given non-admin roles. Users with this role have it automatically
        unassigned.
        """
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
        getter = GetToken(domain, client_id, client_secret=secret)
        token = getter.client_credentials(f"https://{domain}/api/v2/")["access_token"]
        interface = Auth0(domain, token)
        return cls(interface)


def _user_data_without_base_id(users, base_id):
    """Iterate list of users and remove given base ID from their app_metadata.base_ids
    list. This is specific to the data structure in Auth0.
    Return dict of updated app_metadata for each user ID.
    """
    updated_users = {}
    for user in users:
        metadata = user.app_metadata
        base_ids = metadata.base_ids
        if base_ids is None:
            print("No base_ids found, skipping")
            continue

        updated_base_ids = [str(i) for i in base_ids]
        try:
            updated_base_ids.remove(str(base_id))
        except ValueError:
            # An inconsistency between the database and the service happened: the user
            # should have been granted access to the base acc. to their usergroup but it
            # was not properly registered in their app_metadata
            continue
        updated_users[user.user_id] = {"app_metadata": {"base_ids": updated_base_ids}}
    return updated_users
