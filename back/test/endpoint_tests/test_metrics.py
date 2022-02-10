from datetime import date

from utils import assert_successful_request


def test_metrics_query(read_only_client, default_transaction, default_boxes):
    query = "query { metrics { numberOfFamiliesServed } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": 1}

    # Expect no transactions to have been performed in the future
    after = f"{date.today().year + 1}-01-01"
    query = f"""query {{ metrics {{
                numberOfFamiliesServed(after: "{after}") }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": 0}

    query = "query { metrics { numberOfSales } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfSales": default_transaction["count"]}

    # Expect no transactions to have been performed in the future
    after = f"{date.today().year + 1}-01-01"
    query = f"""query {{ metrics {{ numberOfSales(after: "{after}") }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfSales": 0}

    query = "query { metrics { stockOverview { numberOfBoxes numberOfItems } } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    boxes = default_boxes[1:]  # only boxes managed by client's organisation
    assert response == {
        "stockOverview": {
            "numberOfBoxes": len(boxes),
            "numberOfItems": sum(b["items"] for b in boxes),
        }
    }
