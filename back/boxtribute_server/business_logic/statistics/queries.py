from ariadne import QueryType

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
    return compute_beneficiary_demographics(base_id)


@query.field("createdBoxes")
def resolve_created_boxes(*_, base_id=None):
    return compute_created_boxes(base_id)


@query.field("topProductsCheckedOut")
def resolve_top_products_checked_out(*_, base_id):
    return compute_top_products_checked_out(base_id)


@query.field("topProductsDonated")
def resolve_top_products_donated(*_, base_id):
    return compute_top_products_donated(base_id)


@query.field("movedBoxes")
def resolve_moved_boxes(*_, base_id=None):
    return compute_moved_boxes(base_id)
