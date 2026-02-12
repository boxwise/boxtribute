from utils import assert_successful_request


def test_size_ranges_query(client, size_ranges):
    # Test case 99.1.15
    query = """query { sizeRanges { id name } }"""
    response = assert_successful_request(client, query)
    assert response == [{"id": str(s["id"]), "name": s["label"]} for s in size_ranges]
