from datetime import date, datetime, timedelta

from ariadne import QueryType
from flask import g

from ...authz import authorize
from ...models.definitions.beneficiary import Beneficiary

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
def resolve_newlyRegisteredBeneficiaryNumbers(*_):
    now = datetime.now()

    # Last month
    first_day_this_month = now.replace(day=1)
    last_day_of_last_month = first_day_this_month - timedelta(days=1)
    first_day_of_last_month = last_day_of_last_month.replace(day=1)

    # Last quarter
    curr_quarter = (now.month - 1) // 3 + 1
    last_quarter = curr_quarter - 1

    year = now.year
    if last_quarter == 0:
        last_quarter = 4
        year -= 1

    first_month_last_quarter = 3 * (last_quarter - 1) + 1
    quarter_start = date(year, first_month_last_quarter, 1)

    if last_quarter == 4:
        next_quarter_start = date(year + 1, 1, 1)
    else:
        next_quarter_start = date(year, first_month_last_quarter + 3, 1)

    quarter_end = next_quarter_start - timedelta(days=1)

    # Last year
    start_last_year = date(now.year - 1, 1, 1)
    end_last_year = date(now.year - 1, 12, 31)

    # Query counts
    last_month_count = (
        Beneficiary.select()
        .where(
            (Beneficiary.created_on >= first_day_of_last_month)
            & (Beneficiary.created_on <= last_day_of_last_month)
        )
        .count()
    )

    last_quarter_count = (
        Beneficiary.select()
        .where(
            (Beneficiary.created_on >= quarter_start)
            & (Beneficiary.created_on <= quarter_end)
        )
        .count()
    )

    last_year_count = (
        Beneficiary.select()
        .where(
            (Beneficiary.created_on >= start_last_year)
            & (Beneficiary.created_on <= end_last_year)
        )
        .count()
    )

    return {
        "last_month": last_month_count or 0,
        "last_quarter": last_quarter_count or 0,
        "last_year": last_year_count or 0,
    }
