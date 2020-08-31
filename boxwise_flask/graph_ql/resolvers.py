"""GraphQL resolver functionality"""
from ariadne import (
    ObjectType,
    ScalarType,
    gql,
    make_executable_schema,
    snake_case_fallback_resolvers,
)

from boxwise_flask.auth_helper import authorization_test
from boxwise_flask.graph_ql.query_defs import query_defs
from boxwise_flask.graph_ql.type_defs import type_defs
from boxwise_flask.models.base import Base
from boxwise_flask.models.user import User

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
def resolve_all_bases(_, info):
    # discard the first input because it belongs to a root type (Query, Mutation,
    # Subscription). Otherwise it would be a value returned by a parent resolver.
    response = Base.get_all_bases()
    return list(response.dicts())


# not everyone can see all the bases
# see the comment in https://github.com/boxwise/boxwise-flask/pull/19
@query.field("orgBases")
def resolve_org_bases(_, info, org_id):
    response = Base.get_for_organisation(org_id)
    return list(response.dicts())


@query.field("base")
def resolve_camp(_, info, id):
    authorization_test("bases", base_id=id)
    response = Base.get_from_id(id)
    return response


@query.field("allUsers")
def resolve_all_users(_, info):
    response = User.get_all_users()
    return list(response.dicts())


@query.field("user")
def resolve_user(_, info, email):
    response = User.get_user(email)
    return response


schema = make_executable_schema(
    gql(type_defs + query_defs), query, snake_case_fallback_resolvers
)
