import json
import os
import urllib.request
from datetime import timedelta

from flask import current_app

from ..business_logic.metrics.crud import (
    get_time_span,
    number_of_created_records_between,
)
from ..models.definitions.beneficiary import Beneficiary
from ..models.definitions.box import Box
from ..models.utils import utcnow


def get_internal_data():
    titles = ["created boxes", "registered beneficiaries"]
    models = [Box, Beneficiary]
    now = utcnow()
    all_data = []
    for title, model in zip(titles, models):
        data = []
        for duration in [30, 90, 365]:
            time_span = get_time_span(duration_days=duration)
            result = number_of_created_records_between(model, *time_span)

            # Compute trend compared to previous window
            compared_end = now - timedelta(days=duration)
            time_span = get_time_span(duration_days=duration, end_date=compared_end)
            comparison = number_of_created_records_between(model, *time_span)
            trend = (result - comparison) / comparison * 100 if comparison else 0

            data.append(f"Last {duration:>3} days: {result:>5} ({trend:+.1f}%)")
        all_data.append({"title": f"Newly {title}", "data": "\n".join(data)})
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
