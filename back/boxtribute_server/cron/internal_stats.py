import json
import os
import urllib.request
from datetime import timedelta

from flask import current_app

from ..business_logic.metrics.crud import (
    get_time_span,
    number_of_beneficiaries_reached_between,
    number_of_beneficiaries_registered_between,
    number_of_boxes_created_between,
)
from ..models.utils import utcnow
from .formatting import format_as_table, transform_data


def _compute_total(data):
    return sum(
        base_data["number"]
        for org in data.values()
        for base_data in org["bases"].values()
    )


def _compute_base_trends(current_data, comparison_data):
    """Compute trend percentage for each base."""
    trends = {}
    for org_id, org_data in current_data.items():
        if org_id not in trends:
            trends[org_id] = {"name": org_data["name"], "bases": {}}

        for base_id, base_data in org_data["bases"].items():
            current_number = base_data["number"]
            comparison_number = 0
            if (
                org_id in comparison_data
                and base_id in comparison_data[org_id]["bases"]
            ):
                comparison_number = comparison_data[org_id]["bases"][base_id]["number"]

            if comparison_number > 0:
                trend = (current_number - comparison_number) / comparison_number * 100
            else:
                trend = 0

            trends[org_id]["bases"][base_id] = {
                "name": base_data["name"],
                "trend": trend,
            }

    return trends


def get_internal_data():
    now = utcnow()
    all_data = []

    def compute_with_trend(func, duration):
        time_span = get_time_span(duration_days=duration)
        raw_result = func(*time_span)
        result = transform_data(raw_result.dicts())
        current_total = _compute_total(result)

        # Compute trend compared to previous window
        compared_end = now - timedelta(days=duration)
        time_span = get_time_span(duration_days=duration, end_date=compared_end)
        raw_comparison = func(*time_span)
        comparison = transform_data(raw_comparison.dicts())
        comparison_total = _compute_total(comparison)
        total_trend = (
            (current_total - comparison_total) / comparison_total * 100
            if comparison_total
            else 0
        )

        # Compute per-base trends
        base_trends = _compute_base_trends(result, comparison)

        return result, total_trend, base_trends

    titles = [
        "Newly created boxes",
        "Newly registered beneficiaries",
        "Reached beneficiaries",
    ]
    funcs = [
        number_of_boxes_created_between,
        number_of_beneficiaries_registered_between,
        number_of_beneficiaries_reached_between,
    ]
    for title, func in zip(titles, funcs):
        results = []
        total_trends = []
        base_trends_list = []
        for duration in [30, 90, 365]:
            result, total_trend, base_trends = compute_with_trend(func, duration)
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
