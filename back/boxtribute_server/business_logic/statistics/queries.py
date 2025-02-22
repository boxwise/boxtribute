from datetime import timezone

from ariadne import QueryType

from ...authz import authorize, authorize_cross_organisation_access
from ...errors import ExpiredLink, UnknownLink
from ...models.definitions.shareable_link import ShareableLink
from ...models.utils import utcnow
from . import query
from .crud import (
    compute_beneficiary_demographics,
    compute_created_boxes,
    compute_moved_boxes,
    compute_stock_overview,
    compute_top_products_checked_out,
    compute_top_products_donated,
    use_db_replica,
)

public_query = QueryType()


@query.field("beneficiaryDemographics")
@use_db_replica
def resolve_beneficiary_demographics(*_, base_id):
    # No cross-organisational access for beneficiary-related data
    authorize(permission="beneficiary:read", base_id=base_id)
    authorize(permission="tag_relation:read")
    return compute_beneficiary_demographics(base_id)


@query.field("createdBoxes")
@use_db_replica
def resolve_created_boxes(*_, base_id):
    authorize_cross_organisation_access(
        "stock",
        "product",
        "product_category",
        base_id=base_id,
    )
    return compute_created_boxes(base_id)


@query.field("topProductsCheckedOut")
@use_db_replica
def resolve_top_products_checked_out(*_, base_id):
    # No cross-organisational access for beneficiary-related data
    authorize(permission="transaction:read")
    authorize(permission="product:read", base_id=base_id)
    authorize(permission="product_category:read")
    return compute_top_products_checked_out(base_id)


@query.field("topProductsDonated")
@use_db_replica
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
@use_db_replica
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


@query.field("stockOverview")
@use_db_replica
def resolve_stock_overview(*_, base_id):
    authorize_cross_organisation_access(
        "stock",
        "size",
        "location",
        "product",
        "product_category",
        "tag_relation",
        base_id=base_id,
    )
    return compute_stock_overview(base_id)


@public_query.field("resolveLink")
@use_db_replica
def resolve_shareable_link(*_, code):
    # Enable resolving union by masking actual model class with subclass whose name
    # matches the required GraphQL type
    class ResolvedLink(ShareableLink):
        class Meta:
            table_name = ShareableLink._meta.table_name

    link = ResolvedLink.get_or_none(ResolvedLink.code == code)
    if link is None:
        return UnknownLink(code=code)

    if link.valid_until.replace(tzinfo=timezone.utc) < utcnow():
        return ExpiredLink(valid_until=link.valid_until)

    return link
