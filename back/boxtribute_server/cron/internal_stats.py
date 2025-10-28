import json
import os
import urllib.request

from flask import current_app

from ..graph_ql.execution import execute_async
from ..graph_ql.schema import public_api_schema
from ..utils import convert_pascal_to_snake_case


def prettify(word):
    """E.g. newlyCreatedBoxNumbers -> Newly created box numbers"""
    return convert_pascal_to_snake_case(word).replace("_", " ").capitalize()


def get_internal_data():
    stats = ["newlyCreatedBoxNumbers", "newlyRegisteredBeneficiaryNumbers"]
    all_data = []
    for stat in stats:
        graphql_query = {"query": f"{{ {stat} {{ lastYear lastQuarter lastMonth }} }}"}
        result, _ = execute_async(schema=public_api_schema, data=graphql_query)
        all_data.append(
            {
                "title": prettify(stat),
                "data": json.dumps(result.json["data"][stat]),
            }
        )
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
