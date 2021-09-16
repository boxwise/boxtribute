"""GraphQL resolver functionality"""
from ariadne import (
    EnumType,
    MutationType,
    ObjectType,
    ScalarType,
    convert_kwargs_to_snake_case,
    gql,
    make_executable_schema,
    snake_case_fallback_resolvers,
)
from boxwise_flask.auth_helper import authorization_test
from boxwise_flask.graph_ql.mutation_defs import mutation_defs
from boxwise_flask.graph_ql.query_defs import query_defs
from boxwise_flask.graph_ql.type_defs import type_defs
from boxwise_flask.models.base import Base
from boxwise_flask.models.box import Box
from boxwise_flask.models.product import Product
from boxwise_flask.models.product_gender import ProductGender
from boxwise_flask.models.qr_code import QRCode
from boxwise_flask.models.user import User, get_user_from_email_with_base_ids

query = ObjectType("Query")
box = ObjectType("Box")
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
    return Base.get_all_bases()


# not everyone can see all the bases
# see the comment in https://github.com/boxwise/boxwise-flask/pull/19
@query.field("orgBases")
@convert_kwargs_to_snake_case
def resolve_org_bases(_, info, org_id):
    response = Base.get_for_organisation(org_id)
    return response


@query.field("base")
def resolve_base(_, info, id):
    authorization_test("bases", base_id=id)
    response = Base.get_from_id(id)
    return response


@query.field("allUsers")
def resolve_all_users(_, info):
    response = User.get_all_users()
    return response


# TODO get currrent user based on email in token
@query.field("user")
def resolve_user(_, info, email):
    return get_user_from_email_with_base_ids(email)


@query.field("qrExists")
@convert_kwargs_to_snake_case
def resolve_qr_exists(_, info, qr_code):
    try:
        QRCode.get_id_from_code(qr_code)
    except QRCode.DoesNotExist:
        return False
    return True


@query.field("qrBoxExists")
@convert_kwargs_to_snake_case
def resolve_qr_box_exists(_, info, qr_code):
    try:
        qr_id = QRCode.get_id_from_code(qr_code)
        Box.get_box_from_qr(qr_id)
    except Box.DoesNotExist:
        return False
    return True


@query.field("getBoxDetails")
@convert_kwargs_to_snake_case
def resolve_get_box_details_by_id(_, info, box_id=None, qr_code=None):
    if bool(box_id) == bool(qr_code):
        # Either both or none of the arguments are given
        return None

    elif box_id is not None:
        return Box.get(Box.box_id == box_id)

    qr_id = QRCode.get_id_from_code(qr_code)
    return Box.select().where(Box.qr_id == qr_id).get()


@query.field("getBoxesByLocation")
@convert_kwargs_to_snake_case
def resolve_get_boxes_by_location(_, info, location_id):
    return Box.select().where(Box.location == location_id)


@query.field("getBoxesByGender")
@convert_kwargs_to_snake_case
def resolve_get_boxes_by_gender(_, info, gender_id):
    return (
        Box.select()
        .join(Product)
        .join(ProductGender)
        .where(ProductGender.id == gender_id)
    )


@box.field("ID")
def resolve_box_id(obj, info):
    # Custom resolver because the GraphQL Box.ID field refers to the peewee
    # Box.box_id field (not id)
    return obj.box_id


@mutation.field("createBox")
def create_box(_, info, box_creation_input):
    response = Box.create_box(box_creation_input)
    return response


# Translate GraphQL enum into id field of database table
product_gender_type_def = EnumType(
    "ProductGender",
    {
        "UnisexAdult": 3,
    },
)
schema = make_executable_schema(
    gql(type_defs + query_defs + mutation_defs),
    [query, mutation, box, product_gender_type_def],
    snake_case_fallback_resolvers,
)
