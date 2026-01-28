from datetime import date, datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from auth import mock_user_for_request
from boxtribute_server.business_logic.metrics.crud import (
    get_data_for_number_of_active_users,
    number_of_active_users_between,
)
from boxtribute_server.cli.service import ServiceBase
from utils import assert_successful_request


@pytest.mark.parametrize(
    "filters,number",
    [
        ["", 2],
        ["""(after: "2021-01-01")""", 1],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 2],
        ["""(before: "2021-01-01")""", 2],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 2],
        ["""(after: "2022-01-01", before: "2023-01-01")""", 0],
    ],
)
def test_metrics_query_number_of_families_served(read_only_client, filters, number):
    query = f"query {{ metrics {{ numberOfFamiliesServed{filters} }} }}"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": number}


@pytest.mark.parametrize(
    "filters,number",
    [
        ["", 16],
        ["""(after: "2021-01-01")""", 2],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 16],
        ["""(before: "2021-01-01")""", 14],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 9],
        ["""(after: "2022-01-01", before: "2023-01-01")""", 0],
    ],
)
def test_metrics_query_number_of_sales(
    read_only_client, default_transaction, filters, number
):
    query = f"query {{ metrics {{ numberOfSales{filters} }} }}"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfSales": number}


@pytest.mark.parametrize(
    "organisation_id,number_of_families_served,number_of_sales", [[1, 2, 16], [2, 0, 0]]
)
def test_metrics_query_for_god_user(
    read_only_client,
    mocker,
    organisation_id,
    number_of_families_served,
    number_of_sales,
):
    mock_user_for_request(mocker, is_god=True)
    query = f"""query {{ metrics(organisationId: {organisation_id}) {{
                numberOfFamiliesServed numberOfSales }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {
        "numberOfFamiliesServed": number_of_families_served,
        "numberOfSales": number_of_sales,
    }


@pytest.mark.parametrize(
    "start,end,duration,result",
    [
        ('"2020-01-01"', "null", "null", 7),
        ('"2020-01-01"', '"2020-07-01"', "null", 1),
        ('"2020-01-01"', '"2020-07-01"', 30, 1),
        ('"2021-07-01"', "null", "null", 3),
        ('"2022-01-01"', "null", 30, 2),
        ("null", "null", 30, 1),
    ],
)
def test_public_beneficiary_numbers(read_only_client, start, end, duration, result):
    query = f"""query {{ newlyRegisteredBeneficiaryNumbers(
            start: {start}
            end: {end}
            duration: {duration}
            ) }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == result


@pytest.mark.parametrize(
    "start,end,duration,result",
    [
        # all boxes in test/data/box.py are created on 2020-11-27
        ('"2020-01-01"', "null", "null", 16),
        ('"2020-01-01"', '"2020-07-01"', "null", 0),
        ('"2021-07-01"', "null", "null", 0),
        ('"2020-11-01"', "null", 30, 16),
        ("null", "null", 30, 0),
    ],
)
def test_public_box_number(read_only_client, start, end, duration, result):
    query = f"""query {{ newlyCreatedBoxNumbers(
            start: {start}
            end: {end}
            duration: {duration}
            ) }}"""

    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == result


@pytest.mark.parametrize(
    "start,end,duration,result",
    [
        # Bene 1 was created in June 2020 and is family head of benes 2 and 5
        # Benes 1 and 3 (without family) were involved in transactions in Jan 2020
        ('"2020-01-01"', '"2020-12-31"', "null", 4),
        ('"2020-01-01"', "null", 30, 4),
        ("null", '"2020-07-01"', 30, 1),
        # Corresponding beneficiary created in May 2021, then fully deleted
        ("null", '"2021-05-30"', 30, 1),
        # Bene 1 was registered for a service in Nov 2025
        # Bene 6 was created yesterday
        ('"2025-01-01"', "null", "null", 2),
        # Bene 6 was tagged in Jan 2023
        ('"2023-01-01"', "null", 14, 1),
    ],
)
def test_reached_beneficiaries_numbers(read_only_client, start, end, duration, result):
    query = f"""query {{ reachedBeneficiariesNumbers(
            start: {start}
            end: {end}
            duration: {duration}
            ) }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == result


@pytest.mark.parametrize(
    "stat,count",
    [
        ["newlyCreatedBoxNumbers", 2],
        # One from organisation 2 and one (fully-deleted) with organisation NULL
        ["newlyRegisteredBeneficiaryNumbers", 2],
        ["reachedBeneficiariesNumbers", 2],
    ],
)
def test_exclude_test_organisation_in_production(
    read_only_client, monkeypatch, stat, count
):
    # Data from organisation 1 is excluded
    monkeypatch.setenv("ENVIRONMENT", "production")
    query = f"""query {{ {stat}(start: "2020-01-01") }}"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert response == count


def test_number_of_active_users_between(
    monkeypatch,
    read_only_client,
    default_organisation,
    another_organisation,
    default_bases,
):
    # Mock environment variables
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_DOMAIN", "test.auth0.com")
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_CLIENT_ID", "test_client_id")
    monkeypatch.setenv("AUTH0_MANAGEMENT_API_CLIENT_SECRET", "test_secret")

    # Mock the ServiceBase.connect method
    mock_service = MagicMock()
    mock_users = [
        {
            "app_metadata": {"organisation_id": 1},
            "last_login": "2025-01-15T10:00:00Z",
        },
        {
            "app_metadata": {"organisation_id": 1},
            "last_login": "2025-01-20T15:30:00Z",
        },
        {
            "app_metadata": {"organisation_id": 2},
            "last_login": "2025-01-10T08:00:00Z",
        },
        {
            "app_metadata": {"organisation_id": 1},
            "last_login": "2024-12-01T12:00:00Z",  # Outside range
        },
        {
            # no app_metadata
            "last_login": "2025-01-10T08:00:00Z",
        },
        {
            # no organisation ID
            "app_metadata": {},
            "last_login": "2025-01-10T08:00:00Z",
        },
    ]
    mock_service.get_users.return_value = mock_users
    monkeypatch.setattr(ServiceBase, "connect", lambda **_: mock_service)

    users, org_base_info = get_data_for_number_of_active_users()

    # Test the function
    start = datetime(2025, 1, 1, tzinfo=timezone.utc)
    end = datetime(2025, 1, 31, tzinfo=timezone.utc)
    result = number_of_active_users_between(start, end, users, org_base_info)

    # Verify service was called with correct parameters
    two_years_ago = date.today() - timedelta(days=2 * 365)
    mock_service.get_users.assert_called_once_with(
        query=f"last_login:[{two_years_ago.isoformat()} TO *]",
        fields=["app_metadata", "last_login"],
    )

    # Verify results
    assert len(result) == 2  # Two organisations
    org1_result = next(r for r in result if r["organisation_id"] == 1)
    assert org1_result == {
        "organisation_id": default_organisation["id"],
        "organisation_name": default_organisation["name"],
        "base_id": default_bases[0]["id"],
        "base_name": ",".join([b["name"] for b in default_bases[:2]]),
        "number": 2,  # Two users from org 1 in range
    }
    org2_result = next(r for r in result if r["organisation_id"] == 2)
    assert org2_result["number"] == 1  # One user from org 2 in range

    # Test the function a 2nd time to verify cache hit
    start = datetime(2023, 1, 1, tzinfo=timezone.utc)
    end = datetime(2023, 1, 31, tzinfo=timezone.utc)
    result = number_of_active_users_between(start, end, users, org_base_info)
    assert result == [
        {
            "organisation_id": default_organisation["id"],
            "organisation_name": default_organisation["name"],
            "base_id": default_bases[0]["id"],
            "base_name": ",".join([b["name"] for b in default_bases[:2]]),
            "number": 0,
        },
        {
            "organisation_id": another_organisation["id"],
            "organisation_name": another_organisation["name"],
            "base_id": default_bases[2]["id"],
            "base_name": ",".join([b["name"] for b in default_bases[2:4]]),
            "number": 0,
        },
    ]

    # Verify error handling of Auth0 interface
    mock_service.reset_mock()
    mock_service.get_users.side_effect = ValueError()
    monkeypatch.setattr(ServiceBase, "connect", lambda **_: mock_service)
    assert get_data_for_number_of_active_users() == ([], [])
