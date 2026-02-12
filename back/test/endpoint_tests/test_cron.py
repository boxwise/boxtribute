import json
import os
import urllib.error
from unittest.mock import MagicMock, mock_open, patch

import pytest
from auth import mock_user_for_request
from boxtribute_server.blueprints import CRON_PATH
from boxtribute_server.cli.service import ServiceBase
from boxtribute_server.cron.internal_stats import TITLES
from utils import assert_successful_request

reseed_db_path = f"{CRON_PATH}/reseed-db"
housekeeping_path = f"{CRON_PATH}/housekeeping"
internal_stats_path = f"{CRON_PATH}/internal-stats"
headers = [("X-AppEngine-Cron", "true")]


@pytest.mark.parametrize(
    "url", [reseed_db_path, housekeeping_path, internal_stats_path]
)
def test_cron_job_endpoint_errors(client, monkeypatch, url):
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")

    # Permission denied due to missing header
    response = client.get(url)
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Permission denied due to wrong value in header
    response = client.get(url, headers=[("X-AppEngine-Cron", "false")])
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Bad request due to unknown subpath
    response = client.get(f"{CRON_PATH}/unknown-job", headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "unknown job 'unknown-job'"}


def test_housekeeping(client, mocker, default_users):
    mock_user_for_request(mocker, user_id=1, is_god=True)
    response = client.get(housekeeping_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "cleaned up 1 email addresses"}

    user = default_users[6]
    query = f"query {{ user(id: {user['id']}) {{ email }} }}"
    response = assert_successful_request(client, query)
    assert response == {"email": "a.b@web.de.deleted.1031"}

    user = default_users[7]
    query = f"query {{ user(id: {user['id']}) {{ email }} }}"
    response = assert_successful_request(client, query)
    assert response == {"email": user["email"]}


@pytest.mark.skipif(
    not os.getenv("AUTH0_MANAGEMENT_API_CLIENT_SECRET"),
    reason="AUTH0_MANAGEMENT_API_CLIENT_SECRET not set",
)
def test_internal_stats(client, monkeypatch, mocker):
    mock_user_for_request(mocker, user_id=1, is_god=True)
    url = "http://example.com/webhook"
    monkeypatch.setenv("SLACK_WEBHOOK_URL_FOR_INTERNAL_STATS", url)

    # Build a contextmanager-like mock to be returned by urlopen
    mock_response = mocker.MagicMock()
    mock_response.read.return_value = b'{"ok":true}'
    mock_response.getcode.return_value = 200
    cm = mocker.MagicMock()
    cm.__enter__.return_value = mock_response
    cm.__exit__.return_value = None
    mocked_urlopen = mocker.patch("urllib.request.urlopen", return_value=cm)

    # Mock the ServiceBase.connect method
    mock_service = MagicMock()
    mock_users = [
        {
            "app_metadata": {"organisation_id": 1},
            "last_login": "2025-01-15T10:00:00Z",
        },
        {
            "app_metadata": {"organisation_id": 2},
            "last_login": "2025-01-10T08:00:00Z",
        },
    ]
    mock_service.get_users.return_value = mock_users
    monkeypatch.setattr(ServiceBase, "connect", lambda **_: mock_service)
    # Verify successful execution
    response = client.get(internal_stats_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "posted 7 stats, 0 failure(s)"}
    header = "Organisation "
    for call_args_list, title in zip(mocked_urlopen.call_args_list, TITLES):
        part = json.loads(call_args_list.args[0].data.decode())
        assert part["title"] == title
        assert part["data"].startswith(header)
    assert mocked_urlopen.call_count == len(TITLES)

    # Verify error scenario when posting to Slack
    http_err = urllib.error.HTTPError(url, 503, "Service Unavailable", None, None)
    mocker.patch("urllib.request.urlopen", side_effect=http_err)

    response = client.get(internal_stats_path, headers=headers)
    assert response.status_code == 500
    assert response.json == {"message": "posted 0 stats, 7 failure(s)"}


def test_reseed_db_in_staging(client, monkeypatch):
    # Simulate staging environment
    monkeypatch.setenv("ENVIRONMENT", "staging")
    monkeypatch.setenv("MYSQL_DB", "dropapp_staging")

    client.application.debug = False  # for having the app handle errors as if in prod
    # Server error because patched file contains invalid SQL
    with patch("builtins.open", mock_open(read_data="invalid sql;")):
        response = client.get(reseed_db_path, headers=headers)
    assert response.status_code == 500
    assert b"Internal Server Error" in response.data


def test_reseed_db_in_production(client, monkeypatch):
    monkeypatch.setenv("MYSQL_DB", "dropapp_production")
    response = client.get(reseed_db_path, headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "Reset of 'dropapp_production' not permitted"}
