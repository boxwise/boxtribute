"""GraphQL resolver functionality"""
from ariadne import (
    ObjectType,
    ScalarType,
    make_executable_schema,
    snake_case_fallback_resolvers,
)

from .models import Camps, Cms_Users
from .type_defs import type_defs
from .auth_helper import authorization_test

query = ObjectType("Query")

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


@datetime_scalar.serializer
def serialize_datetime(value):
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    return value.isoformat()


# registers this fn as a resolver for the "allBases" field, can use it as the
# resolver for more than one thing by just adding more decorators
@query.field("allBases")
def resolve_all_camps(_, info):
    # discard the first input because it belongs to a root type (Query, Mutation,
    # Subscription). Otherwise it would be a value returned by a parent resolver.
    response = Camps.get_all_camps()
    return list(response.dicts())


@query.field("base")
def resolve_camp(_, info, id):
    authorization_test("bases", base_id=id)
    response = Camps.get_camp(id)
    return response


@query.field("allUsers")
def resolve_all_users(_, info):
    response = Cms_Users.get_all_users()
    return list(response.dicts())


@query.field("user")
def resolve_user(_, info, email):
    response = Cms_Users.get_user(email)
    return response


schema = make_executable_schema(type_defs, query, snake_case_fallback_resolvers)
