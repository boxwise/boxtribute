"""GraphQL resolver functionality"""
from ariadne import (
    MutationType,
    ObjectType,
    ScalarType,
    make_executable_schema,
    snake_case_fallback_resolvers,
)

from .auth_helper import authorization_test
from .models.base import Base
from .models.box import Box
from .models.user import User
from .type_defs import type_defs

query = ObjectType("Query")
mutation = MutationType()

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
def resolve_all_bases(_, info):
    # discard the first input because it belongs to a root type (Query, Mutation,
    # Subscription). Otherwise it would be a value returned by a parent resolver.
    response = Base.get_all_bases()
    return list(response.dicts())


# not everyone can see all the bases
# see the comment in https://github.com/boxwise/boxwise-flask/pull/19
@query.field("orgBases")
def resolve_org_bases(_, info, org_id):
    response = Base.get_bases_by_org_id(org_id)
    return list(response.dicts())


@query.field("base")
def resolve_base(_, info, id):
    authorization_test("bases", base_id=id)
    response = Base.get_base(id)
    return response


@query.field("allUsers")
def resolve_all_users(_, info):
    response = User.get_all_users()
    return list(response.dicts())


# TODO get currrent user based on email in token
@query.field("user")
def resolve_user(_, info, email):
    response = User.get_user(email)
    return response


@mutation.field("createBox")
def create_box(_, info, box_creation_input):
    response = Box.create_box(box_creation_input)
    return response


schema = make_executable_schema(
    type_defs, [query, mutation], snake_case_fallback_resolvers
)
