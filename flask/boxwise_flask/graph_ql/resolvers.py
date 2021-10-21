"""GraphQL resolver functionality"""
from datetime import datetime

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
from peewee import fn

from flask import g

from ..authz import authorize
from ..models.base import Base
from ..models.beneficiary import Beneficiary
from ..models.box import Box
from ..models.crud import (
    create_beneficiary,
    create_box,
    create_qr_code,
    update_beneficiary,
    update_box,
)
from ..models.location import Location
from ..models.organisation import Organisation
from ..models.product import Product
from ..models.product_category import ProductCategory
from ..models.qr_code import QRCode
from ..models.size import Size
from ..models.transaction import Transaction
from ..models.user import User
from ..models.x_beneficiary_language import XBeneficiaryLanguage
from .mutation_defs import mutation_defs
from .query_defs import query_defs
from .type_defs import type_defs

query = ObjectType("Query")
beneficiary = ObjectType("Beneficiary")
base = ObjectType("Base")
box = ObjectType("Box")
location = ObjectType("Location")
organisation = ObjectType("Organisation")
product = ObjectType("Product")
product_category = ObjectType("ProductCategory")
qr_code = ObjectType("QrCode")
user = ObjectType("User")
mutation = MutationType()

datetime_scalar = ScalarType("Datetime")
date_scalar = ScalarType("Date")


@datetime_scalar.serializer
def serialize_datetime(value):
    return value.isoformat()


@date_scalar.serializer
def serialize_date(value):
    return value.isoformat()


@date_scalar.value_parser
def parse_date(value):
    return datetime.strptime(value, "%Y-%m-%d").date()


@user.field("bases")
@query.field("bases")
def resolve_bases(_, info):
    authorize(permission="base:read")
    return Base.select().where(Base.id.in_(g.user["base_ids"]))


@query.field("base")
def resolve_base(_, info, id):
    authorize(permission="base:read")
    authorize(base_id=int(id))
    return Base.get_by_id(id)


@query.field("beneficiary")
def resolve_beneficiary(_, info, id):
    beneficiary = Beneficiary.get_by_id(id)
    authorize(base_id=beneficiary.base.id)
    return beneficiary


@query.field("users")
def resolve_users(_, info):
    return User.select()


@query.field("user")
def resolve_user(_, info, id):
    authorize(user_id=int(id))
    return User.get_by_id(id)


@query.field("qrExists")
@convert_kwargs_to_snake_case
def resolve_qr_exists(_, info, qr_code):
    try:
        QRCode.get_id_from_code(qr_code)
    except QRCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
@convert_kwargs_to_snake_case
def resolve_qr_code(_, info, qr_code):
    return QRCode.get(QRCode.code == qr_code)


@query.field("product")
def resolve_product(_, info, id):
    authorize(permission="product:read")
    product = Product.get_by_id(id)
    authorize(base_id=product.base.id)
    return product


@query.field("box")
@convert_kwargs_to_snake_case
def resolve_box(_, info, box_label_identifier):
    box = (
        Box.select(Box, Base.id)
        .join(Location)
        .join(Base)
        .where(Box.box_label_identifier == box_label_identifier)
        .objects()
        .get()
    )
    authorize(base_id=box.location.base.id)
    return box


@query.field("location")
def resolve_location(_, info, id):
    location = Location.get_by_id(id)
    authorize(base_id=location.base.id)
    return location


@query.field("organisation")
def resolve_organisation(_, info, id):
    authorize(organisation_id=int(id))
    return Organisation.get_by_id(id)


@query.field("productCategory")
def resolve_product_category(_, info, id):
    authorize(permission="category:read")
    return ProductCategory.get_by_id(id)


@query.field("productCategories")
def resolve_product_categories(_, info):
    authorize(permission="category:read")
    return ProductCategory.select()


@query.field("organisations")
def resolve_organisations(_, info):
    return Organisation.select()


@query.field("locations")
def resolve_locations(_, info):
    return Location.select().join(Base).where(Base.id.in_(g.user["base_ids"]))


@query.field("products")
def resolve_products(_, info):
    authorize(permission="product:read")
    return Product.select().join(Base).where(Base.id.in_(g.user["base_ids"]))


@query.field("beneficiaries")
def resolve_beneficiaries(_, info):
    return Beneficiary.select().join(Base).where(Base.id.in_(g.user["base_ids"]))


@beneficiary.field("tokens")
def resolve_beneficiary_tokens(beneficiary_obj, info):
    authorize(permission="transaction:read")
    # If the beneficiary has no transactions yet, the select query returns None
    return (
        Transaction.select(fn.sum(Transaction.count))
        .where(Transaction.beneficiary == beneficiary_obj.id)
        .scalar()
        or 0
    )


@beneficiary.field("isRegistered")
def resolve_beneficiary_is_registered(beneficiary_obj, info):
    return not beneficiary_obj.not_registered


@beneficiary.field("languages")
def resolve_beneficiary_languages(beneficiary_obj, info):
    return [
        x.language.id
        for x in XBeneficiaryLanguage.select().where(
            XBeneficiaryLanguage.beneficiary == beneficiary_obj.id
        )
    ]


@box.field("state")
@location.field("boxState")
def resolve_box_state(obj, info):
    # Instead of a BoxState instance return an integer for EnumType conversion
    return obj.box_state.id


@mutation.field("createQrCode")
@convert_kwargs_to_snake_case
def resolve_create_qr_code(_, info, box_label_identifier=None):
    authorize(permission="qr:write")
    return create_qr_code(
        dict(created_by=g.user["id"], box_label_identifier=box_label_identifier)
    )


@mutation.field("createBox")
@convert_kwargs_to_snake_case
def resolve_create_box(_, info, box_creation_input):
    authorize(permission="stock:write")
    box_creation_input["created_by"] = g.user["id"]
    return create_box(box_creation_input)


@mutation.field("updateBox")
@convert_kwargs_to_snake_case
def resolve_update_box(_, info, box_update_input):
    box_update_input["last_modified_by"] = g.user["id"]
    return update_box(box_update_input)


@mutation.field("createBeneficiary")
@convert_kwargs_to_snake_case
def resolve_create_beneficiary(_, info, beneficiary_creation_input):
    authorize(
        permission="beneficiary:write", base_id=beneficiary_creation_input["base_id"]
    )
    beneficiary_creation_input["created_by"] = g.user["id"]
    return create_beneficiary(beneficiary_creation_input)


@mutation.field("updateBeneficiary")
@convert_kwargs_to_snake_case
def resolve_update_beneficiary(_, info, beneficiary_update_input):
    beneficiary_update_input["last_modified_by"] = g.user["id"]
    return update_beneficiary(beneficiary_update_input)


@base.field("beneficiaries")
def resolve_base_beneficiaries(base_obj, info):
    return Beneficiary.select().where(Beneficiary.base == base_obj.id)


@location.field("boxes")
def resolve_location_boxes(location_obj, info):
    return Box.select().where(Box.location == location_obj.id)


@organisation.field("bases")
def resolve_organisation_bases(organisation_obj, info):
    authorize(permission="base:read")
    return Base.select().where(Base.organisation_id == organisation_obj.id)


@product.field("gender")
def resolve_product_gender(obj, info):
    return obj.id


@product.field("sizes")
def resolve_product_sizes(product_id, info):
    product = Product.get_by_id(product_id)
    sizes = Size.select(Size.label).where(Size.seq == product.size_range.seq)
    return [size.label for size in sizes]


@product_category.field("products")
def resolve_product_category_products(product_category_obj, info):
    authorize(permission="product:read")
    return Product.select().where(Product.category == product_category_obj.id)


@qr_code.field("box")
def resolve_qr_code_box(qr_code_obj, info):
    return Box.get(Box.qr_code == qr_code_obj.id)


@user.field("organisation")
def resolve_user_organisation(obj, info):
    return Organisation.get_by_id(g.user["organisation_id"])


# Translate GraphQL enum into id field of database table
product_gender_type_def = EnumType(
    "ProductGender",
    {
        "Women": 1,
        "UnisexAdult": 3,
    },
)
box_state_type_def = EnumType(
    "BoxState",
    {
        "InStock": 1,
    },
)
gender_type_def = EnumType(
    "HumanGender",
    {
        "Male": "M",
        "Female": "F",
        "Diverse": "D",
    },
)
language_type_def = EnumType(
    "Language",
    {
        "nl": 1,
        "en": 2,
        "fr": 3,
        "de": 4,
        "ar": 5,
        "ckb": 6,
    },
)


schema = make_executable_schema(
    gql(type_defs + query_defs + mutation_defs),
    [
        query,
        mutation,
        date_scalar,
        datetime_scalar,
        beneficiary,
        base,
        box,
        location,
        organisation,
        product,
        product_category,
        qr_code,
        user,
        product_gender_type_def,
        box_state_type_def,
        gender_type_def,
        language_type_def,
    ],
    snake_case_fallback_resolvers,
)
