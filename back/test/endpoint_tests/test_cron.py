from unittest.mock import mock_open, patch

from boxtribute_server.blueprints import CRON_PATH
from utils import assert_bad_user_input, assert_successful_request


def test_cron_job_endpoint(cron_client, monkeypatch):
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    reseed_db_path = f"{CRON_PATH}/reseed-db"

    # Permission denied due to missing header
    response = cron_client.get(reseed_db_path)
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Permission denied due to wrong value in header
    response = cron_client.get(reseed_db_path, headers=[("X-AppEngine-Cron", "false")])
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    headers = [("X-AppEngine-Cron", "true")]
    # Bad request due to unknown subpath
    response = cron_client.get(f"{CRON_PATH}/unknown-job", headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "unknown job 'unknown-job'"}

    # Success; perform actual sourcing of seed (takes about 2s)
    # Create QR code and verify that it is removed after reseeding
    mutation = "mutation { createQrCode { code } }"
    response = assert_successful_request(cron_client, mutation)
    code = response["code"]
    response = cron_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}
    query = f"""query {{ qrCode(qrCode: "{code}") {{ id }} }}"""
    response = assert_bad_user_input(cron_client, query)

    # Server error because patched file contains invalid SQL
    with patch("builtins.open", mock_open(read_data="invalid sql;")):
        response = cron_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 500
    assert b"Internal Server Error" in response.data

    # Bad request due to wrong environment
    monkeypatch.setenv("MYSQL_DB", "dropapp_production")
    response = cron_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "Reset of 'dropapp_production' not permitted"}
