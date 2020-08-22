"""GraphQL resolver functionality"""
from ariadne import (
    ObjectType,
    MutationType,
    ScalarType,
    make_executable_schema,
    snake_case_fallback_resolvers,
)

from .auth_helper import authorization_test
from .models import Bases, Users, Boxes
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
    response = Bases.get_all_bases()
    return list(response.dicts())


# not everyone can see all the bases
# see the comment in https://github.com/boxwise/boxwise-flask/pull/19
@query.field("orgBases")
def resolve_org_bases(_, info, org_id):
    response = Bases.get_bases_by_org_id(org_id)
    return list(response.dicts())


@query.field("base")
def resolve_base(_, info, id):
    authorization_test("bases", base_id=id)
    response = Bases.get_base(id)
    return response


@query.field("allUsers")
def resolve_all_users(_, info):
    response = Users.get_all_users()
    return list(response.dicts())


@query.field("user")
def resolve_user(_, info, email):
    response = Users.get_user(email)
    return response


@mutation.field("createBox")
def create_box(_, info, box_creation_input):
    response = Boxes.create_box(box_creation_input)
    return response


schema = make_executable_schema(
    type_defs, [query, mutation], snake_case_fallback_resolvers
    )
