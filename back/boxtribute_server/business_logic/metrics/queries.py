from ariadne import QueryType
from flask import g

from ...authz import authorize
from .crud import (
    get_time_span,
    number_of_beneficiaries_reached_between,
    number_of_beneficiaries_registered_between,
    number_of_boxes_created_between,
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
    result = number_of_beneficiaries_registered_between(*time_span)
    # Sum up the numbers grouped by organisation and base into a single number
    return sum(element.number for element in result)


@public_query.field("newlyCreatedBoxNumbers")
def resolve_newly_created_box_numbers(*_, start=None, end=None, duration=None):
    time_span = get_time_span(start_date=start, end_date=end, duration_days=duration)
    result = number_of_boxes_created_between(*time_span)
    # Sum up the numbers grouped by organisation and base into a single number
    return sum(element.number for element in result)


@public_query.field("reachedBeneficiariesNumbers")
def resolve_reached_beneficiaries_numbers(*_, start=None, end=None, duration=None):
    time_span = get_time_span(start_date=start, end_date=end, duration_days=duration)
    result = number_of_beneficiaries_reached_between(*time_span)
    # Sum up the numbers grouped by organisation and base into a single number
    return sum(element.number for element in result)
