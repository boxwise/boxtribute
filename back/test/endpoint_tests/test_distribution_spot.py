from utils import assert_successful_request


def test_distribution_spot_query(
    read_only_client,
    distribution_spot,
    default_location,
    distro_spot5_distribution_events,
):
    test_id = str(distribution_spot["id"])
    query = f"""query {{
                distributionSpot(id: {test_id}) {{
                    id
                    name
                    base {{ id }}
                    latitude
                    longitude
                    distributionEvents {{ id }}
                }}
            }}"""
    spot = assert_successful_request(read_only_client, query)
    assert spot == {
        "id": test_id,
        "name": distribution_spot["name"],
        "base": {"id": str(distribution_spot["base"])},
        "latitude": distribution_spot["latitude"],
        "longitude": None,
        "distributionEvents": [
            {"id": str(event["id"])} for event in distro_spot5_distribution_events
        ],
    }

    test_id = str(default_location["id"])
    query = f"""query {{ distributionSpot(id: {test_id}) {{ id }} }}"""
    spot = assert_successful_request(read_only_client, query)
    assert spot is None


def test_distributions_spot_query(read_only_client, distribution_spot):
    query = """query { distributionSpots { id } }"""
    spots = assert_successful_request(read_only_client, query)
    assert spots == [{"id": str(distribution_spot["id"])}]
