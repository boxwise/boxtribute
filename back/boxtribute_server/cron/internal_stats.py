import json
import os
import urllib.request
from datetime import timedelta

from flask import current_app

from ..business_logic.metrics.crud import (
    compute_total,
    get_data_for_number_of_active_users,
    get_time_span,
    number_of_active_users_between,
    number_of_beneficiaries_reached_between,
    number_of_beneficiaries_registered_between,
    number_of_boxes_created_between,
)
from ..business_logic.statistics.crud import number_of_boxes_moved_between
from ..models.utils import utcnow
from .formatting import format_as_table


def _compute_base_trends(current_data, comparison_data):
    """Compute trend percentage for each base."""
    trends = {}

    # Build lookup dict for comparison data
    comparison_lookup = {}
    for row in comparison_data:
        key = (row["organisation_id"], row["base_id"])
        comparison_lookup[key] = row["number"]

    for row in current_data:
        org_id = row["organisation_id"]
        base_id = row["base_id"]
        current_number = row["number"]

        if org_id not in trends:
            trends[org_id] = {"name": row["organisation_name"], "bases": {}}

        comparison_number = comparison_lookup.get((org_id, base_id), 0)

        trend = None
        if comparison_number > 0:
            trend = (current_number - comparison_number) / comparison_number * 100

        trends[org_id]["bases"][base_id] = {"name": row["base_name"], "trend": trend}

    return trends


def compute_with_trend(func, end_date, duration, *args):
    """Run the statistics function on the timespan derived from the given parameters,
    and on the same timespan before, then compute trends.
    """
    time_span = get_time_span(duration_days=duration, end_date=end_date)
    result = func(*time_span, *args)
    current_total = compute_total(result)

    # Compute trend compared to previous window
    compared_end = end_date - timedelta(days=duration)
    time_span = get_time_span(duration_days=duration, end_date=compared_end)
    comparison = func(*time_span, *args)
    comparison_total = compute_total(comparison)
    total_trend = (
        (current_total - comparison_total) / comparison_total * 100
        if comparison_total
        else None  # None indicates n/a
    )
    base_trends = _compute_base_trends(result, comparison)

    return result, total_trend, base_trends


TITLES = [
    "Newly created boxes",
    "Newly registered beneficiaries",
    "Reached beneficiaries",
    "Moved boxes",
    "Unique active users",
]


def get_internal_data():
    now = utcnow()

    funcs = [
        number_of_boxes_created_between,
        number_of_beneficiaries_registered_between,
        number_of_beneficiaries_reached_between,
        number_of_boxes_moved_between,
        number_of_active_users_between,
    ]
    # Some computations need data which is expensive to collect. Fetch this data only
    # once and provide it via a look-up
    data_collections = {
        TITLES[4]: get_data_for_number_of_active_users(),
    }
    for title, func in zip(TITLES, funcs):
        results = []
        total_trends = []
        base_trends_list = []
        for duration in [30, 90, 365]:
            result, total_trend, base_trends = compute_with_trend(
                func, now, duration, *data_collections.get(title, [])
            )
            results.append(result)
            total_trends.append(total_trend)
            base_trends_list.append(base_trends)
        data = format_as_table(
            *results,
            column_names=["30 days", "90 days", "365 days"],
            trends=total_trends,
            base_trends=base_trends_list,
        )
        yield {"title": title, "data": data}


def post_internal_stats_to_slack():
    """Get internal statistics data from the public API and post it to a Slack webhook.
    The webhook will send messages to a channel accordingly.
    """
    url = os.getenv("SLACK_WEBHOOK_URL_FOR_INTERNAL_STATS")
    headers = {"Content-Type": "application/json"}
    successes = []
    failures = []

    for data in get_internal_data():
        data = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req) as response:
                successes.append(
                    {
                        "response": response.read().decode("utf-8"),
                        "code": response.getcode(),
                    }
                )
        except urllib.error.URLError as e:
            failures.append(
                {
                    "response": e.reason,
                    "code": getattr(e, "code", None),
                }
            )
    if failures:
        current_app.logger.error(failures)
    return {"successes": successes, "failures": failures}
