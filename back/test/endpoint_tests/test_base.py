from utils import assert_successful_request


def test_bases_query(read_only_client, default_bases, default_beneficiaries):
    # Test case 99.1.1
    query = """query {
                bases {
                    id
                    name
                    currencyName
                    beneficiaries { elements { id } }
                }
            }"""

    all_bases = assert_successful_request(read_only_client, query)
    assert len(all_bases) == 1

    queried_base = all_bases[0]
    queried_base_id = int(queried_base["id"])
    expected_base = default_bases[queried_base_id]

    assert queried_base_id == expected_base["id"]
    assert queried_base["name"] == expected_base["name"]
    assert queried_base["currencyName"] == expected_base["currency_name"]
    assert len(queried_base["beneficiaries"]["elements"]) == len(default_beneficiaries)


def test_base_query(
    read_only_client,
    default_bases,
    default_distribution_event,
    base1_active_tags,
    base1_classic_locations,
    base1_undeleted_products,
):
    # Test case 99.1.2
    test_id = 1
    query = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    organisation {{ id }}
                    currencyName
                    locations {{ id }}
                    products {{ id }}
                    tags {{ id }}
                    distributionEvents {{ id }}
                }}
            }}"""

    base = assert_successful_request(read_only_client, query)
    expected_base = default_bases[test_id]
    assert int(base["id"]) == expected_base["id"]
    assert base["name"] == expected_base["name"]
    assert base["currencyName"] == expected_base["currency_name"]
    assert int(base["organisation"]["id"]) == expected_base["organisation"]
    assert base["products"] == [{"id": str(p["id"])} for p in base1_undeleted_products]
    assert base["tags"] == [{"id": str(t["id"])} for t in base1_active_tags]
    assert base["locations"] == [
        {"id": str(loc["id"])} for loc in base1_classic_locations
    ]
    assert base["distributionEvents"] == [{"id": str(default_distribution_event["id"])}]
