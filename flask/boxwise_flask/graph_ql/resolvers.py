"""GraphQL resolver functionality"""
from ariadne import MutationType, ObjectType, QueryType, convert_kwargs_to_snake_case
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
from ..models.qr_code import QrCode
from ..models.size import Size
from ..models.transaction import Transaction
from ..models.user import User
from ..models.x_beneficiary_language import XBeneficiaryLanguage
from .pagination import generate_page, pagination_parameters

query = QueryType()
mutation = MutationType()
base = ObjectType("Base")
beneficiary = ObjectType("Beneficiary")
box = ObjectType("Box")
location = ObjectType("Location")
organisation = ObjectType("Organisation")
product = ObjectType("Product")
product_category = ObjectType("ProductCategory")
qr_code = ObjectType("QrCode")
user = ObjectType("User")


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
    authorize(permission="beneficiary:read")
    beneficiary = Beneficiary.get_by_id(id)
    authorize(base_id=beneficiary.base.id)
    return beneficiary


@query.field("users")
def resolve_users(_, info):
    authorize(permission="user:read")
    return User.select()


@query.field("user")
def resolve_user(_, info, id):
    authorize(permission="user:read")
    authorize(user_id=int(id))
    return User.get_by_id(id)


@query.field("qrExists")
@convert_kwargs_to_snake_case
def resolve_qr_exists(_, info, qr_code):
    authorize(permission="qr:read")
    try:
        QrCode.get_id_from_code(qr_code)
    except QrCode.DoesNotExist:
        return False
    return True


@query.field("qrCode")
@convert_kwargs_to_snake_case
def resolve_qr_code(_, info, qr_code):
    authorize(permission="qr:read")
    return QrCode.get(QrCode.code == qr_code)


@query.field("product")
def resolve_product(_, info, id):
    authorize(permission="product:read")
    product = Product.get_by_id(id)
    authorize(base_id=product.base.id)
    return product


@query.field("box")
@convert_kwargs_to_snake_case
def resolve_box(_, info, box_label_identifier):
    authorize(permission="stock:read")
    box = (
        Box.select(Box, Location.base)
        .join(Location)
        .join(Base)
        .where(Box.box_label_identifier == box_label_identifier)
        .get()
    )
    authorize(base_id=box.location.base.id)
    return box


@query.field("location")
def resolve_location(_, info, id):
    authorize(permission="location:read")
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
    authorize(permission="location:read")
    return Location.select().join(Base).where(Base.id.in_(g.user["base_ids"]))


@query.field("products")
def resolve_products(_, info):
    authorize(permission="product:read")
    return Product.select().join(Base).where(Base.id.in_(g.user["base_ids"]))


@query.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_beneficiaries(_, info, pagination_input=None):
    authorize(permission="beneficiary:read")
    cursor, limit = pagination_parameters(pagination_input)
    base_filter_condition = Base.id.in_(g.user["base_ids"])
    pagination_condition = cursor.pagination_condition(Beneficiary)
    selection = Beneficiary.select().join(Base)
    beneficiaries = (
        selection.where((base_filter_condition) & (pagination_condition))
        .order_by(Beneficiary.id)
        .limit(limit + 1)
    )
    return generate_page(
        base_filter_condition,
        elements=beneficiaries,
        cursor=cursor,
        limit=limit,
        selection=selection,
    )


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
    authorize(permission="stock:write")
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
    authorize(permission="stock:write")
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
    # Use target base ID if specified, otherwise fall back to user's default base
    authorize(
        permission="beneficiary:write",
        base_id=beneficiary_update_input.get("base_id", g.user["base_ids"][0]),
    )
    beneficiary_update_input["last_modified_by"] = g.user["id"]
    return update_beneficiary(beneficiary_update_input)


@base.field("locations")
def resolve_base_locations(base_obj, info):
    authorize(permission="location:read")
    return Location.select().where(Location.base == base_obj.id)


@base.field("beneficiaries")
@convert_kwargs_to_snake_case
def resolve_base_beneficiaries(base_obj, info, pagination_input=None):
    authorize(permission="beneficiary:read")
    cursor, limit = pagination_parameters(pagination_input)
    base_filter_condition = Beneficiary.base == base_obj.id
    pagination_condition = cursor.pagination_condition(Beneficiary)
    beneficiaries = (
        Beneficiary.select()
        .where((base_filter_condition) & (pagination_condition))
        .order_by(Beneficiary.id)
        .limit(limit + 1)
    )
    return generate_page(
        base_filter_condition, elements=beneficiaries, cursor=cursor, limit=limit
    )


@location.field("boxes")
def resolve_location_boxes(location_obj, info):
    authorize(permission="stock:read")
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
    authorize(permission="stock:read")
    return Box.get(Box.qr_code == qr_code_obj.id)


@user.field("organisation")
def resolve_user_organisation(obj, info):
    return Organisation.get_by_id(g.user["organisation_id"])
