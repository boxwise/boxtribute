from utils import assert_successful_request


def test_query_beneficiary_demographics(read_only_client):
    query = """query { beneficiaryDemographics(baseIds: [1]) {
        gender age createdOn count } }"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert len(response) == 2
