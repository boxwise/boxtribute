from utils import assert_successful_request


def test_tags_query(read_only_client, tags):
    query = """query { tags { id name } }"""
    queried_tag = assert_successful_request(read_only_client, query)[0]
    assert queried_tag["name"] == tags[0]["name"]
    assert int(queried_tag["id"]) == tags[0]["id"]
