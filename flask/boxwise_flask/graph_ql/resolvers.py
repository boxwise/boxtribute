"""GraphQL resolver functionality"""
from ariadne import (
    MutationType,
    ObjectType,
    ScalarType,
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
from boxwise_flask.models.size import Size
from boxwise_flask.models.qr_code import QRCode
from boxwise_flask.models.user import User, get_user_from_email_with_base_ids
from boxwise_flask.models.product import Product

import logging


query = ObjectType("Query")
product = ObjectType("Product")
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
def resolve_qr_exists(_, info, qr_code):
    try:
        QRCode.get_id_from_code(qr_code)
    except QRCode.DoesNotExist:
        return False
    return True


@query.field("boxIdByQrCode")
def resolve_box_id_by_qr_code(_, info, qr_code):
    try:
        qr_id = QRCode.get_id_from_code(qr_code)
        box = Box.get_box_from_qr(qr_id)
        return box.box_id
    except Box.DoesNotExist:
        return None
    return None


@query.field("product")
def resolve_product(_, info, product_id):
    return Product.get_product(product_id)


@query.field("box")
def resolve_box(_, info, id):
    # qr_id = QRCode.get_id_from_code(id)
    return Box.get_box(id)


@query.field("products")
def resolve_products(_, info):
    logging.warning('hitting products resolver!')
    return Product.get_all()


@mutation.field("createBox")
def create_box(_, info, box_creation_input):
    response = Box.create_box(box_creation_input)
    return response


@product.field("sizes")
def resolve_sizes(product_id, info_):
    # logging.warning('hitting sizes resolver!')
    # logging.warning(product_id)
    logging.warning(info_)
    product = Product.get_product(product_id)
    # product.size_range.seq
    sizes = Size.select(Size.label).where(
        Size.seq == product.size_range.seq
        )
    return map(lambda size: size.label, sizes)
    # return product_id


schema = make_executable_schema(
    gql(type_defs + query_defs + mutation_defs),
    [query, product, mutation],
    snake_case_fallback_resolvers,
)
