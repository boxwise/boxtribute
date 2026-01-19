import json
import os
import urllib.request
from datetime import timedelta

from flask import current_app

from ..business_logic.metrics.crud import (
    compute_total,
    get_time_span,
    number_of_beneficiaries_reached_between,
    number_of_beneficiaries_registered_between,
    number_of_boxes_created_between,
)
from ..business_logic.statistics.crud import compute_moved_boxes
from ..models.definitions.base import Base
from ..models.definitions.organisation import Organisation
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


def compute_with_trend(func, end_date, duration):
    """Run the statistics function on the timespan derived from the given parameters,
    and on the same timespan before, then compute trends.
    """
    time_span = get_time_span(duration_days=duration, end_date=end_date)
    result = func(*time_span)
    current_total = compute_total(result)

    # Compute trend compared to previous window
    compared_end = end_date - timedelta(days=duration)
    time_span = get_time_span(duration_days=duration, end_date=compared_end)
    comparison = func(*time_span)
    comparison_total = compute_total(comparison)
    total_trend = (
        (current_total - comparison_total) / comparison_total * 100
        if comparison_total
        else None  # None indicates n/a
    )
    base_trends = _compute_base_trends(result, comparison)

    return result, total_trend, base_trends


def number_of_boxes_moved_between(start, end):
    """Compute number of moved boxes for all active bases in the given time span.
    Active bases are non-deleted or deleted within the last 2 years.
    """
    # Get all active bases (non-deleted or deleted within last 2 years)
    two_years_ago = utcnow() - timedelta(days=365 * 2)
    active_bases = Base.select(Base.id, Base.name, Organisation.id, Organisation.name).join(
        Organisation
    ).where(
        (Base.deleted_on.is_null()) | (Base.deleted_on >= two_years_ago)
    )

    results = []
    for base in active_bases:
        # Get moved boxes data for this base
        moved_boxes_data = compute_moved_boxes(base.id)
        
        # Count boxes moved in the specified time span
        total_boxes = 0
        for fact in moved_boxes_data.facts:
            moved_on = fact.get("moved_on")
            if moved_on and start <= moved_on <= end:
                # boxes_count can be negative (e.g., when boxes move back from Donated to InStock)
                total_boxes += fact.get("boxes_count", 0)
        
        if total_boxes != 0:  # Only include bases with moved boxes
            results.append({
                "organisation_id": base.organisation.id,
                "organisation_name": base.organisation.name,
                "base_id": base.id,
                "base_name": base.name,
                "number": total_boxes,
            })
    
    return results


def get_internal_data():
    now = utcnow()
    all_data = []

    titles = [
        "Newly created boxes",
        "Newly registered beneficiaries",
        "Reached beneficiaries",
        "Moved boxes",
    ]
    funcs = [
        number_of_boxes_created_between,
        number_of_beneficiaries_registered_between,
        number_of_beneficiaries_reached_between,
        number_of_boxes_moved_between,
    ]
    for title, func in zip(titles, funcs):
        results = []
        total_trends = []
        base_trends_list = []
        for duration in [30, 90, 365]:
            result, total_trend, base_trends = compute_with_trend(func, now, duration)
            results.append(result)
            total_trends.append(total_trend)
            base_trends_list.append(base_trends)
        data = format_as_table(
            *results, trends=total_trends, base_trends=base_trends_list
        )
        all_data.append({"title": title, "data": data})
    return all_data


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
