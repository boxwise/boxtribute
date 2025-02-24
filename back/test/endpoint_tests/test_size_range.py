from utils import assert_successful_request


def test_size_ranges_query(read_only_client, size_ranges):
    # Test case 99.1.15
    query = """query { sizeRanges { id name } }"""
    response = assert_successful_request(read_only_client, query)
    assert response == [{"id": str(s["id"]), "name": s["label"]} for s in size_ranges]
