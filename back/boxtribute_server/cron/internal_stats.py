import json
import os
import urllib.request
from datetime import timedelta

from flask import current_app

from ..business_logic.metrics.crud import (
    get_time_span,
    number_of_created_records_between,
    reached_beneficiaries_numbers,
)
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.utils import utcnow


def get_internal_data():
    now = utcnow()
    all_data = []

    def compute_with_trend(func, duration, *args):
        time_span = get_time_span(duration_days=duration)
        result = func(*args, *time_span)

        # Compute trend compared to previous window
        compared_end = now - timedelta(days=duration)
        time_span = get_time_span(duration_days=duration, end_date=compared_end)
        comparison = func(*args, *time_span)
        trend = (result - comparison) / comparison * 100 if comparison else 0
        return result, trend

    titles = [
        "Newly created boxes",
        "Newly registered beneficiaries",
        "Reached beneficiaries",
    ]
    funcs = [
        number_of_created_records_between,
        number_of_created_records_between,
        reached_beneficiaries_numbers,
    ]
    args_list = [[Box], [Beneficiary], []]
    for title, func, args in zip(titles, funcs, args_list):
        data = []
        for duration in [30, 90, 365]:
            result, trend = compute_with_trend(func, duration, *args)
            data.append(f"Last {duration:>3} days: {result:>5} ({trend:+.1f}%)")
        all_data.append({"title": title, "data": "\n".join(data)})
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
