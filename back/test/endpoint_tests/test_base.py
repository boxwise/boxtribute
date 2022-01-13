from utils import assert_successful_request


def test_bases_query(read_only_client, default_bases):
    query = """query {
                bases {
                    id
                    name
                    currencyName
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


def test_base_query(read_only_client, default_location, default_bases):
    test_id = 1
    query = f"""query Base {{
                base(id: {test_id}) {{
                    id
                    name
                    organisation {{
                        id
                    }}
                    currencyName
                    locations {{
                        id
                    }}
                }}
            }}"""

    base = assert_successful_request(read_only_client, query)
    expected_base = default_bases[test_id]
    assert int(base["id"]) == expected_base["id"]
    assert base["name"] == expected_base["name"]
    assert base["currencyName"] == expected_base["currency_name"]
    assert int(base["organisation"]["id"]) == expected_base["organisation"]

    locations = base["locations"]
    assert len(locations) == 1
    assert int(locations[0]["id"]) == default_location["id"]
