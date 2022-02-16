import pytest
from utils import assert_successful_request


@pytest.mark.parametrize(
    "filters,number",
    [
        ["", 2],
        ["""(after: "2021-01-01")""", 1],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 2],
        ["""(before: "2021-01-01")""", 1],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 1],
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
        ["", 2],
        ["""(after: "2021-01-01")""", 1],
        ["""(after: "2022-01-01")""", 0],
        ["""(before: "2022-01-01")""", 2],
        ["""(before: "2021-01-01")""", 1],
        ["""(before: "2019-01-01")""", 0],
        ["""(after: "2020-01-01", before: "2021-01-01")""", 1],
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


def test_metrics_query(read_only_client, default_transaction, default_boxes):
    query = "query { metrics { stockOverview { numberOfBoxes numberOfItems } } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    boxes = default_boxes[1:]  # only boxes managed by client's organisation
    assert response == {
        "stockOverview": {
            "numberOfBoxes": len(boxes),
            "numberOfItems": sum(b["items"] for b in boxes),
        }
    }

    query = """query { metrics { movedStockOverview {
                productCategoryName numberOfBoxes numberOfItems } } }"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    boxes = default_boxes[1:]  # only boxes managed by client's organisation
    assert response == {
        "movedStockOverview": [
            {
                "productCategoryName": "Underwear / Nightwear",
                "numberOfBoxes": len(boxes),
                "numberOfItems": sum(b["items"] for b in boxes),
            }
        ]
    }
