from datetime import date, datetime, timedelta

from ariadne import QueryType
from flask import g

from ...authz import authorize
from .crud import number_of_beneficiaries_registered_between

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
def resolve_newly_registered_beneficiary_numbers(*_):
    now = datetime.today()

    # Last month
    start_this_month = now.replace(day=1)
    end_last_month = start_this_month - timedelta(days=1)
    start_last_month = end_last_month.replace(day=1)

    # Last quarter
    curr_quarter = (now.month - 1) // 3 + 1
    last_quarter = curr_quarter - 1

    if last_quarter == 0:
        # Previous quarter was Q4 of last year
        last_quarter = 4
        year = now.year - 1
        start_quarter = date(year, 10, 1)  # October 1st
        end_quarter = date(year, 12, 31)  # December 31st
    else:
        # Previous quarter was in current year
        year = now.year
        first_month_last_quarter = 3 * (last_quarter - 1) + 1
        start_quarter = date(year, first_month_last_quarter, 1)
        next_quarter_start = date(year, first_month_last_quarter + 3, 1)
        end_quarter = next_quarter_start - timedelta(days=1)

        # Last year
        start_last_year = date(now.year - 1, 1, 1)
        end_last_year = date(now.year - 1, 12, 31)

    return {
        "last_month": number_of_beneficiaries_registered_between(
            start_last_month, end_last_month
        ),
        "last_quarter": number_of_beneficiaries_registered_between(
            start_quarter, end_quarter
        ),
        "last_year": number_of_beneficiaries_registered_between(
            start_last_year, end_last_year
        ),
    }
