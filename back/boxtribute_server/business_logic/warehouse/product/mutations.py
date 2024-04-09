from ariadne import MutationType
from flask import g

from ....authz import authorize, handle_unauthorized
from ....errors import ResourceDoesNotExist
from ....models.definitions.product import Product
from .crud import create_custom_product, delete_product, edit_custom_product

mutation = MutationType()


@mutation.field("createCustomProduct")
@handle_unauthorized
def resolve_create_custom_product(*_, creation_input):
    base_id = creation_input["base_id"]
    authorize(permission="product:write", base_id=base_id)

    return create_custom_product(user_id=g.user.id, **creation_input)


@mutation.field("editCustomProduct")
@handle_unauthorized
def resolve_edit_custom_product(*_, edit_input):
    try:
        product = Product.get_by_id(edit_input["id"])
    except Product.DoesNotExist:
        return ResourceDoesNotExist(name="Product", id=edit_input["id"])
    authorize(permission="product:write", base_id=product.base_id)
    return edit_custom_product(user_id=g.user.id, **edit_input)


@mutation.field("deleteProduct")
@handle_unauthorized
def resolve_deleted_product(*_, id):
    try:
        product = Product.get_by_id(id)
    except Product.DoesNotExist:
        return ResourceDoesNotExist(name="Product", id=id)
    authorize(permission="product:write", base_id=product.base_id)
    return delete_product(user_id=g.user.id, id=id)
