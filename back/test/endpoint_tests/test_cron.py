from unittest.mock import mock_open, patch

import pytest
from auth import mock_user_for_request
from boxtribute_server.blueprints import CRON_PATH
from utils import assert_bad_user_input, assert_successful_request

reseed_db_path = f"{CRON_PATH}/reseed-db"
headers = [("X-AppEngine-Cron", "true")]


@pytest.mark.parametrize("url", [reseed_db_path])
def test_cron_job_endpoint_errors(dropapp_dev_client, monkeypatch, url):
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")

    # Permission denied due to missing header
    response = dropapp_dev_client.get(url)
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Permission denied due to wrong value in header
    response = dropapp_dev_client.get(url, headers=[("X-AppEngine-Cron", "false")])
    assert response.status_code == 401
    assert response.json == {"message": "unauthorized"}

    # Bad request due to unknown subpath
    response = dropapp_dev_client.get(f"{CRON_PATH}/unknown-job", headers=headers)
    assert response.status_code == 400
    assert response.json == {"message": "unknown job 'unknown-job'"}


def test_reseed_db(cron_client, monkeypatch, mocker):
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    mock_user_for_request(mocker, user_id=1, is_god=True)

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

    # Verify generation of fake data
    query = "query { tags { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == 24 + 80 - 8  # base seed + generated - deleted

    query = "query { locations { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == 29 + 24  # base seed + generated

    query = "query { beneficiaries { totalCount } }"
    response = assert_successful_request(cron_client, query)
    assert response["totalCount"] == 1008 + 900  # base seed + generated

    query = "query { products { totalCount } }"
    response = assert_successful_request(cron_client, query)
    assert response["totalCount"] == 617 + 51 * 4  # base seed + generated

    query = "query { transferAgreements { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == 4

    nr_of_boxes = 0
    for base_id in [1, 2, 3, 4]:
        query = f"query {{ boxes(baseId: {base_id}) {{ totalCount }} }}"
        response = assert_successful_request(cron_client, query)
        nr_of_boxes += response["totalCount"]
    assert nr_of_boxes == 784 + 400  # base seed + generated

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
