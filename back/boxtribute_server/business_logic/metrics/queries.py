from datetime import datetime, timedelta

from ariadne import QueryType
from flask import g

from ...authz import authorize
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from .crud import number_of_created_records_between

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

    ranges = get_time_ranges()

    last_month = ranges["lastMonth"]
    last_quarter = ranges["lastQuarter"]
    last_year = ranges["lastYear"]

    return {
        "last_month": number_of_created_records_between(Beneficiary, *last_month),
        "last_quarter": number_of_created_records_between(Beneficiary, *last_quarter),
        "last_year": number_of_created_records_between(Beneficiary, *last_year),
    }


@public_query.field("newlyCreatedBoxes")
def resolve_newly_created_boxes(*_):

    ranges = get_time_ranges()

    last_month = ranges["lastMonth"]
    last_quarter = ranges["lastQuarter"]
    last_year = ranges["lastYear"]

    return {
        "last_month": number_of_created_records_between(Box, *last_month),
        "last_quarter": number_of_created_records_between(Box, *last_quarter),
        "last_year": number_of_created_records_between(Box, *last_year),
    }


def get_time_ranges():
    now = datetime.today()

    # Last month
    start_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_last_month = start_this_month - timedelta(microseconds=1)
    start_last_month = end_last_month.replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )

    # Last quarter
    curr_quarter = (now.month - 1) // 3 + 1
    last_quarter = curr_quarter - 1

    if last_quarter == 0:
        # Previous quarter was Q4 of last year
        year = now.year - 1
        start_last_quarter = datetime(year, 10, 1)
        end_last_quarter = datetime(year + 1, 1, 1) - timedelta(microseconds=1)
    else:
        # Previous quarter was in current year
        year = now.year
        first_month_last_quarter = 3 * (last_quarter - 1) + 1
        start_last_quarter = datetime(year, first_month_last_quarter, 1)
        next_quarter_start = datetime(year, first_month_last_quarter + 3, 1)
        end_last_quarter = next_quarter_start - timedelta(microseconds=1)

    # Last year
    start_last_year = datetime(now.year - 1, 1, 1)
    end_last_year = datetime(now.year, 1, 1) - timedelta(microseconds=1)

    return {
        "lastMonth": [start_last_month, end_last_month],
        "lastQuarter": [start_last_quarter, end_last_quarter],
        "lastYear": [start_last_year, end_last_year],
    }
