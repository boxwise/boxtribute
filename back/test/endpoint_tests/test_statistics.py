from utils import assert_successful_request


def test_query_beneficiary_demographics(read_only_client):
    query = """query { beneficiaryDemographics(baseIds: [1]) {
        gender age createdOn count } }"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert len(response) == 2

    query = """query { beneficiaryDemographics {
        gender age createdOn count } }"""
    response = assert_successful_request(read_only_client, query, endpoint="public")
    assert len(response) == 3


def test_query_created_boxes(read_only_client, products, product_categories):
    query = """query { createdBoxes {
        facts {
            createdOn categoryId productId gender boxesCount itemsCount
        }
        dimensions {
            product { id name }
            category { id name }
    } } }"""
    data = assert_successful_request(read_only_client, query, endpoint="public")
    facts = data.pop("facts")
    assert len(facts) == 2
    assert facts[0]["boxesCount"] == 2
    assert data == {
        "dimensions": {
            "product": [{"id": str(p["id"]), "name": p["name"]} for p in products[:2]],
            "category": [
                {"id": str(c["id"]), "name": c["name"]}
                for c in sorted(product_categories, key=lambda c: c["id"])
            ],
        }
    }

    query = """query { createdBoxes(baseId: 1) { facts { boxesCount } } }"""
    data = assert_successful_request(read_only_client, query, endpoint="public")
    assert data == {"facts": [{"boxesCount": 7}]}
