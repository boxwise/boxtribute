from utils import assert_successful_request


def test_queries(auth0_client):
    query = """query BoxIdAndItems {
                qrCode(qrCode: "03a6ad3e5a8677fe350f9849a208552") { box { id } }
            }"""
    queried_box = assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {"id": "67"}

    query = """query { box(labelIdentifier: "728544") { state } }"""
    queried_box = assert_successful_request(auth0_client, query)
    assert queried_box == {"state": "Donated"}

    for resource in [
        "bases",
        "organisations",
        "users",
        "locations",
        "productCategories",
    ]:
        query = f"query {{ {resource} {{ id }} }}"
        response = assert_successful_request(auth0_client, query, field=resource)
        assert len(response) > 0

    for resource in ["beneficiaries", "products"]:
        query = f"query {{ {resource} {{ elements {{ id }} }} }}"
        response = assert_successful_request(auth0_client, query, field=resource)
        assert len(response) > 0


def test_mutations(auth0_client):
    mutation = "mutation { createQrCode { id } }"
    response = assert_successful_request(auth0_client, mutation, field="createQrCode")
    assert response is not None

    mutation = """mutation { createBox(boxCreationInput: {
                   productId: 1,
                   items: 10,
                   locationId: 1,
                   sizeId: 1,
                   comment: "new things"
                }) { location { id } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"location": {"id": "1"}}

    mutation = """mutation { updateBox(boxUpdateInput: {
                    labelIdentifier: "728544", productId: 2
                }) { product { id } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"product": {"id": "2"}}

    mutation = """mutation { createBeneficiary(creationInput: {
                    firstName: "Any",
                    lastName: "Body",
                    baseId: 1,
                    groupIdentifier: "de4db33f",
                    dateOfBirth: "2000-01-30",
                    gender: Female,
                    isVolunteer: false,
                    isRegistered: false
                }) { id firstName } }"""
    response = assert_successful_request(auth0_client, mutation)
    beneficiary_id = response.pop("id")
    assert response == {"firstName": "Any"}

    mutation = f"""mutation {{ updateBeneficiary(updateInput: {{
                    id: {beneficiary_id}, firstName: "Some"
                    }}) {{ firstName }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"firstName": "Some"}
