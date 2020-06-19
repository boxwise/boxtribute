"""GraphQL resolver functionality"""
from ariadne import ObjectType, make_executable_schema, snake_case_fallback_resolvers

from .models import Camps, Cms_Users
from .type_defs import type_defs

query = ObjectType("Query")


# registers this fn as a resolver for the "hello" field, can use it as the
# resolver for more than one thing by just adding more decorators
@query.field("hello")
def resolve_hello(
    # discard the first input because it belongs to a root type (Query, Mutation,
    # Subscription). Otherwise it would be a value returned by a parent resolver.
    _,
    info,
):
    request = info.context
    user_agent = request.headers.get("User-Agent", "Guest")
    return "Hello, {}!".format(user_agent)


@query.field("allBases")
def resolve_all_camps(_, info):
    response = Camps.get_camps()
    return list(response.dicts())

@query.field("allUsers")
def resolve_all_users(_, info):
    response = Cms_Users.get_all_users()
    return list(response.dicts())


@query.field("user")
def resolve_user(_, info, email):
    response = Cms_Users.get_user(email)
    return response


schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)
