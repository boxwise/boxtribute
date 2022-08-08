from boxtribute_server.enums import DistributionEventState
from utils import assert_successful_request


def test_distribution_event_query(read_only_client, default_distribution_event):
    test_id = 1
    query = f"""query DistributionEvent {{
                distributionEvent(id: {test_id}) {{
                    id
                    name
                    state
                }}
            }}"""

    distribution_event = assert_successful_request(read_only_client, query)
    expected_distribution_event = default_distribution_event
    assert int(distribution_event["id"]) == expected_distribution_event["id"]
    assert distribution_event["name"] == expected_distribution_event["name"]
    assert distribution_event["state"] == DistributionEventState.Planning.name
