from ariadne import ObjectType, make_executable_schema, snake_case_fallback_resolvers
from flask import jsonify
from .type_defs import type_defs
from .models import Camps


query = ObjectType("Query")

# registers this fn as a resolver for the "hello" field, can use it as the
# resolver for more than one thing by just adding more decorators
@query.field("hello")
def resolve_hello(
    _, info
):  # discard the first input because it belongs to a root type (Query, Mutation, Subscription). Otherwise it would be a value returned by a parent resolver.
    request = info.context
    user_agent = request.headers.get("User-Agent", "Guest")
    return "Hello, {}!".format(user_agent)


@query.field("allCamps")
def resolve_all_camps(_, info):
    response = Camps.get_camps()
    return list(response.dicts())


schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)
