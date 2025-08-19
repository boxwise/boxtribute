from unittest.mock import mock_open, patch

import pytest
from auth import mock_user_for_request
from boxtribute_server.blueprints import CRON_PATH
from boxtribute_server.cron.data_faking import (
    NR_BASES,
    NR_OF_BENEFICIARIES_PER_LARGE_BASE,
    NR_OF_BENEFICIARIES_PER_SMALL_BASE,
    NR_OF_BOXES_PER_BASE,
    NR_OF_BOXES_PER_LARGE_BASE,
    NR_OF_CREATED_LOCATIONS_PER_BASE,
    NR_OF_CREATED_TAGS_PER_BASE,
    NR_OF_DELETED_TAGS_PER_BASE,
)
from utils import assert_successful_request

reseed_db_path = f"{CRON_PATH}/reseed-db"
housekeeping_path = f"{CRON_PATH}/housekeeping"
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


def test_reseed_db(cron_client, monkeypatch, mocker, default_users):
    mock_user_for_request(mocker, user_id=1, is_god=True)
    # Housekeeping tests
    response = cron_client.get(housekeeping_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "cleaned up 1 email addresses"}

    user = default_users[6]
    query = f"query {{ user(id: {user['id']}) {{ email }} }}"
    response = assert_successful_request(cron_client, query)
    assert response == {"email": "a.b@web.de.deleted.1031"}

    user = default_users[7]
    query = f"query {{ user(id: {user['id']}) {{ email }} }}"
    response = assert_successful_request(cron_client, query)
    assert response == {"email": user["email"]}

    # Reseed-DB tests
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")

    # Success; perform actual sourcing of seed (takes about 2s)
    # Create QR code and verify that it is removed after reseeding
    mutation = "mutation { createQrCode { ...on QrCode { id code } } }"
    response = assert_successful_request(cron_client, mutation)
    code = response["code"]
    response = cron_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}
    query = f"""query {{ qrCode(code: "{code}") {{
        ...on ResourceDoesNotExistError {{ id name }} }} }}"""
    response = assert_successful_request(cron_client, query)
    assert response == {"id": None, "name": "QrCode"}

    # Verify generation of fake data
    query = "query { tags { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == NR_BASES * (
        NR_OF_CREATED_TAGS_PER_BASE - NR_OF_DELETED_TAGS_PER_BASE
    )

    query = "query { locations { id } }"
    response = assert_successful_request(cron_client, query)
    assert (
        len(response) == 7 + NR_BASES * NR_OF_CREATED_LOCATIONS_PER_BASE
    )  # minimal seed + generated

    query = "query { beneficiaries { totalCount } }"
    response = assert_successful_request(cron_client, query)
    assert (
        response["totalCount"]
        == 9
        + (NR_BASES - 2) * NR_OF_BENEFICIARIES_PER_SMALL_BASE
        + NR_OF_BENEFICIARIES_PER_LARGE_BASE
    )  # minimal seed + generated

    query = "query { products { totalCount } }"
    response = assert_successful_request(cron_client, query)
    assert response["totalCount"] == 8 + 84 * 4  # minimal seed + generated

    query = "query { transferAgreements { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == 1 + 4  # minimal seed + generated

    query = "query { shipments { id } }"
    response = assert_successful_request(cron_client, query)
    assert len(response) == 10

    nr_of_boxes = 0
    for base_id in [1, 2, 3, 4]:
        query = f"query {{ boxes(baseId: {base_id}) {{ totalCount }} }}"
        response = assert_successful_request(cron_client, query)
        nr_of_boxes += response["totalCount"]
    assert (
        nr_of_boxes
        == (NR_BASES - 1) * NR_OF_BOXES_PER_BASE + NR_OF_BOXES_PER_LARGE_BASE
    )

    # Simulate staging environment
    monkeypatch.setenv("ENVIRONMENT", "staging")
    response = cron_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}

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
