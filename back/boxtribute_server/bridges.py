import json
import os
import urllib

from .auth import get_auth_string_from_header, get_token_from_auth_header
from .exceptions import AuthenticationFailed


def authenticate_auth0_log_stream():
    try:
        token = get_token_from_auth_header(get_auth_string_from_header())
        if token != os.getenv("AUTH0_LOG_STREAM_TOKEN"):
            return {"message": "invalid token"}
    except AuthenticationFailed as e:
        return {"details": e.error}


def send_transformed_logs_to_slack(payload):
    # Auth0 streams in JSON array format

    # Transform data structure because Slack webhook can't handle nested JSON
    # https://slack.com/help/articles/360041352714-Build-a-workflow--Create-a-workflow-that-starts-outside-of-Slack
    transformed_logs = [
        {
            "title": f"{log['data']['description']} [type: {log['data']['type']}]",
            "auth0_link": f"https://manage.auth0.com/#/logs/{log['data']['log_id']}",
            "log_id": log["data"]["log_id"],
        }
        for log in payload
    ]

    url = os.getenv("SLACK_WEBHOOK_URL_FOR_AUTH0_STREAM")
    headers = {"Content-Type": "application/json"}
    successes = []
    failures = []
    for log in transformed_logs:
        data = json.dumps(log).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req) as response:
                successes.append(
                    {
                        "response": response.read().decode("utf-8"),
                        "code": response.getcode(),
                        "log_id": log["log_id"],
                    }
                )
        except urllib.error.URLError as e:
            failures.append(
                {
                    "response": e.reason,
                    "code": getattr(e, "code", None),
                    "log_id": log["log_id"],
                }
            )
    return {"successes": successes, "failures": failures}
