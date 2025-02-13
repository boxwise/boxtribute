import json
import os
import urllib

from .auth import get_auth_string_from_header, get_token_from_auth_header
from .exceptions import AuthenticationFailed


def authenticate_auth0_log_stream():
    """Verify the request's Authorization header. It must be of form 'Bearer TOKEN', and
    TOKEN must match with the stored value.
    The token is set in the Auth0 Monitoring menu, subsection Streams, in the settings
    of the item "Boxtribute slack".
    """
    try:
        token = get_token_from_auth_header(get_auth_string_from_header())
        if token != os.getenv("AUTH0_LOG_STREAM_TOKEN"):
            return {"message": "invalid token"}
    except AuthenticationFailed as e:
        return {"details": e.error}


def send_transformed_logs_to_slack(payload):
    """Transform the streams from Auth0 (JSON array format) into single requests with
    flattened data to the Slack webhook (it can't handle nested JSON).
    Return information about successful and failed requests to the webhook.
    See also:
    https://marketplace.auth0.com/integrations/slack-log-streaming
    https://auth0.com/docs/deploy-monitor/logs/log-event-type-codes
    https://slack.com/help/articles/17542172840595-Build-a-workflow--Create-a-workflow-in-Slack
    https://slack.com/help/articles/360041352714-Build-a-workflow--Create-a-workflow-that-starts-outside-of-Slack
    """
    link_prefix = "https://manage.auth0.com/dashboard/eu/boxtribute-production/logs"
    transformed_logs = [
        {
            "title": f"{log['data']['description']} [type: {log['data']['type']}]",
            "auth0_link": f"{link_prefix}/{log['data']['log_id']}",
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
