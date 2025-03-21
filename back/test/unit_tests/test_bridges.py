import urllib


def test_auth0_slack_bridge(no_db_client, monkeypatch, mocker):
    path = "/auth0-slack-bridge"
    token = "testtoken"

    # Scenario: Handle missing header
    response = no_db_client.post(path)
    assert response.status_code == 401
    assert response.json["details"]["code"] == "authorization_header_missing"

    # Add the Authorization header to the client's requests
    no_db_client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    # Scenario: Handle token mismatch
    monkeypatch.setenv("AUTH0_LOG_STREAM_TOKEN", "wrongtoken")
    response = no_db_client.post(path)
    assert response.status_code == 401
    assert response.json == {"message": "invalid token"}

    # Set correct token
    monkeypatch.setenv("AUTH0_LOG_STREAM_TOKEN", token)

    # Scenario: Handle empty payload
    response = no_db_client.post(path, json={})
    assert response.status_code == 200
    assert response.json == {"message": "empty payload"}

    # Scenario: Successfully forward Auth0 log stream to Slack
    url = "https://www.test.it"
    monkeypatch.setenv("SLACK_WEBHOOK_URL_FOR_AUTH0_STREAM", url)
    # Mocking Python context managers ("with" blocks) is painful...
    # https://stackoverflow.com/a/58310550
    mocked_open = mocker.patch("urllib.request.urlopen")
    cm = mocked_open.return_value.__enter__.return_value
    cm.getcode.return_value = 200
    cm.read.return_value = b"okay"
    raw_logs = [
        {"data": {"log_id": 1, "type": "fp", "description": "Failed login"}},
        {"data": {"log_id": 2, "type": "fs", "description": "Failed signup"}},
    ]
    response = no_db_client.post(path, json=raw_logs)
    assert response.status_code == 200
    assert response.json == {
        "successes": [
            {"response": "okay", "code": 200, "log_id": 1},
            {"response": "okay", "code": 200, "log_id": 2},
        ],
        "failures": [],
    }

    # Scenario: Simulate error when forwarding to Slack
    reason = "internal_server_error"
    mocked_open.side_effect = urllib.error.HTTPError(url, 503, reason, None, None)
    response = no_db_client.post(path, json=raw_logs)
    assert response.status_code == 500
    assert response.json == {
        "successes": [],
        "failures": [
            {"response": reason, "code": 503, "log_id": 1},
            {"response": reason, "code": 503, "log_id": 2},
        ],
    }
