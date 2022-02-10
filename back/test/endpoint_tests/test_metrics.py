from datetime import date

from utils import assert_successful_request


def test_metrics_query(read_only_client):
    query = "query { metrics { numberOfFamiliesServed } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": 1}

    # Expect no transactions to have been performed in the future
    after = f"{date.today().year + 1}-01-01"
    query = f"""query {{ metrics {{
                numberOfFamiliesServed(after: "{after}") }} }}"""
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": 0}
