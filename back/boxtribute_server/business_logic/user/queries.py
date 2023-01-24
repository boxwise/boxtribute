from ariadne import QueryType
from flask import g

from ...authz import authorize
from ...models.definitions.user import User

query = QueryType()


@query.field("users")
def resolve_users(*_):
    authorize(permission="user:read")
    # Disable for non-god users until integration of Auth0 implemented
    return User.select() if g.user.is_god else []


@query.field("user")
def resolve_user(*_, id):
    authorize(permission="user:read")
    return User.get_by_id(id)
