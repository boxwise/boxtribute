import os
from pprint import pprint

import dotenv

dotenv.load_dotenv(".env.production")

from auth0.authentication import GetToken
from auth0.exceptions import Auth0Error
from auth0.management import Auth0


# https://stackoverflow.com/a/6993694/3865876
class Struct:
    def __init__(self, data):
        for name, value in data.items():
            setattr(self, name, self._wrap(value))

    def _wrap(self, value):
        if isinstance(value, (tuple, list, set, frozenset)):
            return type(value)([self._wrap(v) for v in value])
        else:
            return Struct(value) if isinstance(value, dict) else value

    def __repr__(self):
        return "{%s}" % str(
            ", ".join("'%s': %s" % (k, repr(v)) for (k, v) in self.__dict__.items())
        )

    def __getattr__(self, key):
        try:
            return super().__getattr__(key)
        except AttributeError:
            return


domain = os.environ["AUTH0_MANAGEMENT_API_DOMAIN"]
client_id = os.environ["AUTH0_MANAGEMENT_API_CLIENT_ID"]
client_secret = os.environ["AUTH0_MANAGEMENT_API_CLIENT_SECRET"]

# get_token = GetToken(domain, client_id, client_secret=client_secret)
# token = get_token.client_credentials(f"https://{domain}/api/v2/")
# mgmt_api_token = token["access_token"]
# print(mgmt_api_token)

mgmt_api_token = os.environ["AUTH0_MANAGEMENT_API_TOKEN"]
auth0 = Auth0(domain, mgmt_api_token)

# https://github.com/auth0/auth0-python/blob/master/auth0/management/users.py
admin_usergroup_id = 20
try:
    result = Struct(
        auth0.users.list(
            q=f"app_metadata.usergroup_id:{admin_usergroup_id}",
            fields=["app_metadata", "user_id", "name"],
        )
    )
except Auth0Error:
    pass

pprint(result)
print(f"Fetched {result.total} users from Auth0...")
updated_users = {}
base_id = 11
for user in result.users:
    metadata = user.app_metadata
    base_ids = metadata.base_ids
    if base_ids is None:
        print("No base_ids found, skipping")
    updated_base_ids = base_ids.copy()
    try:
        updated_base_ids.remove(str(base_id))
    except ValueError:
        pass
    updated_users[user.user_id] = {"app_metadata": {"base_ids": updated_base_ids}}
pprint(updated_users)

# https://auth0.com/docs/api/management/v2/users/patch-users-by-id
# app_metadata field will be upserted
for user_id, data in updated_users.items():
    # might throw some Auth0Error
    auth0.users.update(user_id, data)

role_ids = ["rol_x"]
for role_id in role_ids:
    auth0.role.delete(role_id)
