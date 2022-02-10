from utils import assert_successful_request


def test_metrics_query(read_only_client):
    query = "query { metrics { numberOfFamiliesServed } }"
    response = assert_successful_request(read_only_client, query, field="metrics")
    assert response == {"numberOfFamiliesServed": 1}
