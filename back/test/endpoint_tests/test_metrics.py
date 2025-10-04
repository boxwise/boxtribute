from datetime import datetime

import pytest
from auth import mock_user_for_request
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
        ["", 4],
        ["""(after: "2021-01-01")""", 3],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 4],
        ["""(before: "2021-01-01")""", 4],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 4],
        ["""(after: "2022-01-01", before: "2023-01-01")""", 0],
    ],
)
def test_metrics_query_number_of_beneficiaries_served(
    read_only_client, filters, number
):
    query = f"query {{ metrics {{ numberOfBeneficiariesServed{filters} }} }}"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfBeneficiariesServed": number}


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


def test_metrics_query_stock_overview(
    read_only_client, default_transaction, default_boxes, default_location_boxes
):
    query = "query { metrics { stockOverview { numberOfBoxes numberOfItems } } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    boxes = default_location_boxes  # only boxes managed by client's organisation
    assert response == {
        "stockOverview": {
            "numberOfBoxes": len(boxes),
            "numberOfItems": sum(b["number_of_items"] for b in boxes),
        }
    }


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


def test_public_beneficiary_numbers(read_only_client):
    query = """query { newlyRegisteredBeneficiaryNumbers {
                      lastMonth
                      lastQuarter
                      lastYear
                      } }"""

    response = assert_successful_request(read_only_client, query, endpoint="public")

    current_month = datetime.today().month
    assert response == {
        "lastMonth": 1,
        "lastQuarter": 1 if current_month in [1, 4, 7, 10] else 0,
        "lastYear": 1 if current_month == 1 else 0,
    }
