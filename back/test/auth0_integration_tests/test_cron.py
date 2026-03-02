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
headers = [("X-AppEngine-Cron", "true")]


def test_reseed_db(monkeypatch, auth0_client, mocker):
    # Simulate development environment
    mock_user_for_request(mocker, user_id=1, is_god=True)
    monkeypatch.setenv("MYSQL_DB", "dropapp_dev")
    monkeypatch.setenv("ENVIRONMENT", "development")

    # Success; perform actual sourcing of seed (takes about 2s)
    # Create QR code and verify that it is removed after reseeding
    mutation = "mutation { createQrCode { id code } }"
    response = assert_successful_request(auth0_client, mutation)
    code = response["code"]
    response = auth0_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}
    query = f"""query {{ qrCode(code: "{code}") {{
        __typename
        ...on ResourceDoesNotExistError {{ id name }} }} }}"""
    response = assert_successful_request(auth0_client, query)
    assert response == {
        "__typename": "ResourceDoesNotExistError",
        "id": None,
        "name": "QrCode",
    }

    # Verify generation of fake data
    query = "query { tags { id } }"
    response = assert_successful_request(auth0_client, query)
    assert len(response) == NR_BASES * (
        NR_OF_CREATED_TAGS_PER_BASE - NR_OF_DELETED_TAGS_PER_BASE
    )

    query = "query { locations { id } }"
    response = assert_successful_request(auth0_client, query)
    assert (
        len(response) == 7 + NR_BASES * NR_OF_CREATED_LOCATIONS_PER_BASE
    )  # minimal seed + generated

    query = "query { beneficiaries { totalCount } }"
    response = assert_successful_request(auth0_client, query)
    assert (
        response["totalCount"]
        == 9
        + (NR_BASES - 2) * NR_OF_BENEFICIARIES_PER_SMALL_BASE
        + NR_OF_BENEFICIARIES_PER_LARGE_BASE
    )  # minimal seed + generated

    query = "query { products { totalCount } }"
    response = assert_successful_request(auth0_client, query)
    assert response["totalCount"] == 8 + 84 * 4  # minimal seed + generated

    query = "query { transferAgreements { id } }"
    response = assert_successful_request(auth0_client, query)
    assert len(response) == 1 + 4  # minimal seed + generated

    query = "query { shipments { id } }"
    response = assert_successful_request(auth0_client, query)
    assert len(response) == 10

    nr_of_boxes = 0
    for base_id in [1, 2, 3, 4]:
        query = f"query {{ boxes(baseId: {base_id}) {{ totalCount }} }}"
        response = assert_successful_request(auth0_client, query)
        nr_of_boxes += response["totalCount"]
    assert (
        nr_of_boxes
        == (NR_BASES - 1) * NR_OF_BOXES_PER_BASE + NR_OF_BOXES_PER_LARGE_BASE
    )

    # Simulate staging environment
    monkeypatch.setenv("MYSQL_DB", "dropapp_staging")
    monkeypatch.setenv("ENVIRONMENT", "staging")
    response = auth0_client.get(reseed_db_path, headers=headers)
    assert response.status_code == 200
    assert response.json == {"message": "reseed-db job executed"}
