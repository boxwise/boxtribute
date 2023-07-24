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
        ["", 3],
        ["""(after: "2021-01-01")""", 2],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 3],
        ["""(before: "2021-01-01")""", 3],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 3],
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
        ["", 3],
        ["""(after: "2021-01-01")""", 1],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 3],
        ["""(before: "2021-01-01")""", 2],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 2],
        ["""(after: "2022-01-01", before: "2023-01-01")""", 0],
    ],
)
def test_metrics_query_number_of_sales(
    read_only_client, default_transaction, filters, number
):
    query = f"query {{ metrics {{ numberOfSales{filters} }} }}"
    response = assert_successful_request(read_only_client, query, field="metrics")
    # The two test transactions have a count of 2 each
    count = default_transaction["count"]
    assert response == {"numberOfSales": number * count}


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
    "filters,box_ids",
    [
        ["", [2, 3, 5, 6, 7, 9, 10]],
        ["""(after: "2021-01-01")""", [6, 7]],
        ["""(after: "2022-01-01")""", []],
        ["""(before: "2022-01-01")""", [2, 3, 5, 6, 7, 9, 10]],
        ["""(before: "2021-01-01")""", [2, 3, 5, 9, 10]],
        ["""(before: "2019-01-01")""", []],
        ["""(after: "2020-01-01", before: "2021-01-01")""", [2, 3, 5, 9, 10]],
        ["""(after: "2021-01-01", before: "2022-01-01")""", [6, 7]],
        ["""(after: "2022-01-01", before: "2023-01-01")""", []],
    ],
)
def test_metrics_query_moved_stock_overview(
    read_only_client, default_transaction, default_boxes, filters, box_ids
):
    query = f"""query {{ metrics {{ movedStockOverview{filters} {{
                productCategoryName numberOfBoxes numberOfItems }} }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")

    boxes = [b for b in default_boxes if b["id"] in box_ids]
    number_of_boxes = len(boxes)
    if number_of_boxes == 0:
        assert response == {"movedStockOverview": []}
    else:
        assert response == {
            "movedStockOverview": [
                {
                    "productCategoryName": "Underwear / Nightwear",
                    "numberOfBoxes": number_of_boxes,
                    "numberOfItems": sum(b["number_of_items"] for b in boxes),
                }
            ]
        }


@pytest.mark.parametrize(
    "organisation_id,number_of_families_served,number_of_sales", [[1, 2, 6], [2, 0, 0]]
)
def test_metrics_query_for_god_user(
    read_only_client,
    mocker,
    organisation_id,
    number_of_families_served,
    number_of_sales,
):
    mock_user_for_request(mocker, permissions=["*"], organisation_id=None)
    query = f"""query {{ metrics(organisationId: {organisation_id}) {{
                numberOfFamiliesServed numberOfSales }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {
        "numberOfFamiliesServed": number_of_families_served,
        "numberOfSales": number_of_sales,
    }
