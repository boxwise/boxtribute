from auth import mock_user_for_request
from utils import assert_successful_request


def test_bases_query(
    read_only_client, default_base, deleted_base, default_beneficiaries, mocker
):
    # Test case 99.1.1
    query = """query {
                bases {
                    id
                    name
                    currencyName
                    deletedOn
                    beneficiaries { elements { id } }
                }
            }"""

    bases = assert_successful_request(read_only_client, query)
    assert len(bases[0]["beneficiaries"].pop("elements")) == len(default_beneficiaries)
    assert bases == [
        {
            "id": str(default_base["id"]),
            "name": default_base["name"],
            "currencyName": default_base["currency_name"],
            "deletedOn": None,
            "beneficiaries": {},
        }
    ]

    # Test case 99.1.1a
    mock_user_for_request(mocker, base_ids=[deleted_base["id"]])
    query = """query { bases(filterInput: {includeDeleted: false}) { id } }"""
    response = assert_successful_request(read_only_client, query)
    assert response == []

    query = """query { bases { id } }"""
    response = assert_successful_request(read_only_client, query)
    assert response == []

    query = """query { bases(filterInput: {includeDeleted: true}) { id deletedOn } }"""
    response = assert_successful_request(read_only_client, query)
    assert response == [
        {
            "id": str(deleted_base["id"]),
            "deletedOn": deleted_base["deleted_on"].isoformat() + "+00:00",
        }
    ]


def test_base_query(
    read_only_client,
    default_base,
    default_tracking_group,
    distribution_spot,
    distro_spot5_distribution_events,
    distro_spot5_distribution_events_before_return_state,
    distro_spot5_distribution_events_in_return_state,
    base1_active_tags,
    base1_undeleted_classic_locations,
    base1_undeleted_products,
):
    # Test case 99.1.2
    test_id = str(default_base["id"])
    query = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    organisation {{ id }}
                    currencyName
                    locations {{ id }}
                    products(filterInput: {{ type: All }}) {{ id }}
                    tags {{ id }}
                    distributionSpots {{ id }}
                    distributionEvents {{ id }}
                    distributionEventsBeforeReturnedFromDistributionState {{ id }}
                    distributionEventsInReturnedFromDistributionState {{ id }}
                    distributionEventsStatistics {{ productId }}
                    distributionEventsTrackingGroups {{ id }}
                }}
            }}"""

    base = assert_successful_request(read_only_client, query)
    assert base == {
        "id": test_id,
        "name": default_base["name"],
        "currencyName": default_base["currency_name"],
        "organisation": {"id": str(default_base["organisation"])},
        "products": [{"id": str(p["id"])} for p in base1_undeleted_products],
        "tags": [{"id": str(t["id"])} for t in base1_active_tags],
        "locations": [
            {"id": str(loc["id"])} for loc in base1_undeleted_classic_locations
        ],
        "distributionSpots": [{"id": str(distribution_spot["id"])}],
        "distributionEvents": [
            {"id": str(event["id"])} for event in distro_spot5_distribution_events
        ],
        "distributionEventsBeforeReturnedFromDistributionState": [
            {"id": str(event["id"])}
            for event in distro_spot5_distribution_events_before_return_state
        ],
        "distributionEventsInReturnedFromDistributionState": [
            {"id": str(event["id"])}
            for event in distro_spot5_distribution_events_in_return_state
        ],
        "distributionEventsStatistics": [],
        "distributionEventsTrackingGroups": [{"id": str(default_tracking_group["id"])}],
    }
