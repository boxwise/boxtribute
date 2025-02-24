from ariadne import MutationType
from flask import g

from ....authz import authorize, handle_unauthorized
from ....errors import ResourceDoesNotExist
from ....models.definitions.product import Product
from .crud import (
    create_custom_product,
    delete_product,
    disable_standard_product,
    edit_custom_product,
    edit_standard_product_instantiation,
    enable_standard_product,
    enable_standard_products,
)

mutation = MutationType()


@mutation.field("createCustomProduct")
@handle_unauthorized
def resolve_create_custom_product(*_, creation_input):
    base_id = creation_input["base_id"]
    authorize(permission="product:write", base_id=base_id)
    authorize(permission="size_range:read")
    authorize(permission="product_category:read")

    return create_custom_product(user_id=g.user.id, **creation_input)


@mutation.field("editCustomProduct")
@handle_unauthorized
def resolve_edit_custom_product(*_, edit_input):
    id = int(edit_input["id"])
    if (product := Product.get_or_none(id)) is None:
        return ResourceDoesNotExist(name="Product", id=id)
    authorize(permission="product:write", base_id=product.base_id)
    authorize(permission="size_range:read")
    authorize(permission="product_category:read")

    return edit_custom_product(user_id=g.user.id, product=product, **edit_input)


@mutation.field("deleteProduct")
@handle_unauthorized
def resolve_deleted_product(*_, id):
    if (product := Product.get_or_none(int(id))) is None:
        return ResourceDoesNotExist(name="Product", id=id)
    authorize(permission="product:write", base_id=product.base_id)

    return delete_product(user_id=g.user.id, product=product)


@mutation.field("enableStandardProduct")
@handle_unauthorized
def resolve_enable_standard_product(*_, enable_input):
    base_id = enable_input["base_id"]
    authorize(permission="product:write", base_id=base_id)
    authorize(permission="size_range:read")

    return enable_standard_product(user_id=g.user.id, **enable_input)


@mutation.field("enableStandardProducts")
@handle_unauthorized
def resolve_enable_standard_products(*_, enable_input):
    base_id = enable_input["base_id"]
    authorize(permission="product:write", base_id=base_id)
    return enable_standard_products(user_id=g.user.id, **enable_input)


@mutation.field("editStandardProductInstantiation")
@handle_unauthorized
def resolve_edit_standard_product_instantiation(*_, edit_input):
    id = int(edit_input["id"])
    if (product := Product.get_or_none(id)) is None:
        return ResourceDoesNotExist(name="Product", id=id)
    authorize(permission="product:write", base_id=product.base_id)
    authorize(permission="size_range:read")

    return edit_standard_product_instantiation(
        user_id=g.user.id, product=product, **edit_input
    )


@mutation.field("disableStandardProduct")
@handle_unauthorized
def resolve_disable_standard_product(*_, instantiation_id):
    if (product := Product.get_or_none(int(instantiation_id))) is None:
        return ResourceDoesNotExist(name="Product", id=instantiation_id)
    authorize(permission="product:write", base_id=product.base_id)

    return disable_standard_product(user_id=g.user.id, product=product)
