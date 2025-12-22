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
        bases[base_id]["number"]
        for org in data.values()
        for bases in org["bases"]
        for base_id in bases
    )


def get_internal_data():
    now = utcnow()
    all_data = []

    def compute_with_trend(func, duration, *args):
        time_span = get_time_span(duration_days=duration)
        raw_result = func(*args, *time_span)
        result = transform_data(raw_result.dicts())
        current_total = _compute_total(result)

        # Compute trend compared to previous window
        compared_end = now - timedelta(days=duration)
        time_span = get_time_span(duration_days=duration, end_date=compared_end)
        raw_comparison = func(*args, *time_span)
        comparison = transform_data(raw_comparison.dicts())
        comparison_total = _compute_total(comparison)
        trend = (
            (current_total - comparison_total) / comparison_total * 100
            if comparison_total
            else 0
        )
        return result, trend

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
        trends = []
        for duration in [30, 90, 365]:
            result, trend = compute_with_trend(func, duration)
            results.append(result)
            trends.append(trend)
        data = format_as_table(*results, trends=trends)
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
