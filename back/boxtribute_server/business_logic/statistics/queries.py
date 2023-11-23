from ariadne import QueryType

from ...authz import authorize_cross_organisation_access
from ...models.definitions.base import Base
from .crud import (
    compute_beneficiary_demographics,
    compute_created_boxes,
    compute_moved_boxes,
    compute_top_products_checked_out,
    compute_top_products_donated,
)

query = QueryType()
public_query = QueryType()


def _validate_existing_base(base_id):
    """Raise `peewee.DoesNotExist` exception if base with given ID does not exist in the
    database. This will be reported as a BAD_USER_INPUT error.
    """
    Base.select(Base.id).where(Base.id == base_id).get()


@query.field("beneficiaryDemographics")
def resolve_beneficiary_demographics(*_, base_id):
    authorize_cross_organisation_access("beneficiary", "tag_relation", base_id=base_id)
    return compute_beneficiary_demographics(base_id)


@query.field("createdBoxes")
def resolve_created_boxes(*_, base_id):
    authorize_cross_organisation_access(
        "stock",
        "product",
        "product_category",
        base_id=base_id,
    )
    return compute_created_boxes(base_id)


@query.field("topProductsCheckedOut")
def resolve_top_products_checked_out(*_, base_id):
    authorize_cross_organisation_access(
        "transaction",
        "product",
        "product_category",
        base_id=base_id,
    )
    return compute_top_products_checked_out(base_id)


@query.field("topProductsDonated")
def resolve_top_products_donated(*_, base_id):
    authorize_cross_organisation_access(
        "stock",
        "product",
        "product_category",
        "history",
        "size",
        base_id=base_id,
    )
    return compute_top_products_donated(base_id)


@query.field("movedBoxes")
def resolve_moved_boxes(*_, base_id=None):
    authorize_cross_organisation_access(
        "stock",
        "product",
        "product_category",
        "location",
        "history",
        "size",
        base_id=base_id,
    )

    return compute_moved_boxes(base_id)


@public_query.field("beneficiaryDemographics")
def public_resolve_beneficiary_demographics(*_, base_id):
    _validate_existing_base(base_id)
    return compute_beneficiary_demographics(base_id)


@public_query.field("createdBoxes")
def public_resolve_created_boxes(*_, base_id):
    _validate_existing_base(base_id)
    return compute_created_boxes(base_id)


@public_query.field("topProductsCheckedOut")
def public_resolve_top_products_checked_out(*_, base_id):
    _validate_existing_base(base_id)
    return compute_top_products_checked_out(base_id)


@public_query.field("topProductsDonated")
def public_resolve_top_products_donated(*_, base_id):
    _validate_existing_base(base_id)
    return compute_top_products_donated(base_id)


@public_query.field("movedBoxes")
def public_resolve_moved_boxes(*_, base_id=None):
    _validate_existing_base(base_id)
    return compute_moved_boxes(base_id)
