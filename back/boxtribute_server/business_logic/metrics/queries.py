from ariadne import QueryType
from flask import g

from ...authz import authorize
from ...db import use_db_replica
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from .crud import (
    compute_moved_boxes_statistics,
    get_time_span,
    number_of_created_records_between,
)

query = QueryType()
public_query = QueryType()


@query.field("metrics")
def resolve_metrics(*_, organisation_id=None):
    # Default to current user's organisation ID
    organisation_id = organisation_id or g.user.organisation_id
    # Non-god users are only permitted to fetch their organisation's metrics, the god
    # user however can access any organisation's metrics
    authorize(organisation_id=organisation_id)

    # Pass organisation ID to child resolvers
    return {"organisation_id": organisation_id}


@public_query.field("newlyRegisteredBeneficiaryNumbers")
def resolve_newly_registered_beneficiary_numbers(
    *_, start=None, end=None, duration=None
):
    time_span = get_time_span(start_date=start, end_date=end, duration_days=duration)
    return number_of_created_records_between(Beneficiary, *time_span)


@public_query.field("newlyCreatedBoxNumbers")
def resolve_newly_created_box_numbers(*_, start=None, end=None, duration=None):
    time_span = get_time_span(start_date=start, end_date=end, duration_days=duration)
    return number_of_created_records_between(Box, *time_span)


@public_query.field("movedBoxesStatistics")
@use_db_replica
def resolve_moved_boxes_statistics(*_):
    """
    Returns metrics on the number of boxes moved across ALL bases in the database
    for the last month, quarter, and year.

    This is a public API endpoint (no authorization required) that provides
    high-level aggregate metrics without sensitive details.
    """
    return compute_moved_boxes_statistics()
