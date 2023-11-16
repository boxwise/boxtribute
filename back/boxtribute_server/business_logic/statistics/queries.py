from ariadne import QueryType

from ...authz import authorize
from .crud import (
    compute_beneficiary_demographics,
    compute_created_boxes,
    compute_moved_boxes,
    compute_top_products_checked_out,
    compute_top_products_donated,
)

query = QueryType()
public_query = QueryType()


@query.field("beneficiaryDemographics")
def resolve_beneficiary_demographics(*_, base_id):
    authorize(permission="beneficiary:read", base_id=base_id)
    authorize(permission="tag_relation:read")

    return compute_beneficiary_demographics(base_id)


@query.field("createdBoxes")
def resolve_created_boxes(*_, base_id):
    authorize(permission="stock:read", base_id=base_id)
    authorize(permission="product:read", base_id=base_id)
    authorize(permission="product_category:read")

    return compute_created_boxes(base_id)


@query.field("topProductsCheckedOut")
def resolve_top_products_checked_out(*_, base_id):
    return compute_top_products_checked_out(base_id)


@query.field("topProductsDonated")
def resolve_top_products_donated(*_, base_id):
    authorize(permission="stock:read", base_id=base_id)
    authorize(permission="product:read", base_id=base_id)
    authorize(permission="product_category:read")
    authorize(permission="history:read")
    authorize(permission="size:read")

    return compute_top_products_donated(base_id)


@query.field("movedBoxes")
def resolve_moved_boxes(*_, base_id=None):
    authorize(permission="stock:read", base_id=base_id)
    authorize(permission="product:read", base_id=base_id)
    authorize(permission="location:read", base_id=base_id)
    authorize(permission="product_category:read")
    authorize(permission="history:read")
    authorize(permission="size:read")

    return compute_moved_boxes(base_id)


@public_query.field("beneficiaryDemographics")
def public_resolve_beneficiary_demographics(*_, base_id):
    return compute_beneficiary_demographics(base_id)


@public_query.field("createdBoxes")
def public_resolve_created_boxes(*_, base_id):
    return compute_created_boxes(base_id)


@public_query.field("topProductsCheckedOut")
def public_resolve_top_products_checked_out(*_, base_id):
    return compute_top_products_checked_out(base_id)


@public_query.field("topProductsDonated")
def public_resolve_top_products_donated(*_, base_id):
    return compute_top_products_donated(base_id)


@public_query.field("movedBoxes")
def public_resolve_moved_boxes(*_, base_id=None):
    return compute_moved_boxes(base_id)
