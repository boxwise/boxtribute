import pytest
from utils import assert_successful_request


@pytest.mark.parametrize("endpoint", ["api", "graphql"])
def test_queries(auth0_client, endpoint):
    def _assert_successful_request(*args, **kwargs):
        return assert_successful_request(*args, **kwargs, endpoint=endpoint)

    query = """query BoxIdAndItems {
                qrCode(qrCode: "03a6ad3e5a8677fe350f9849a208552") { box { id } }
            }"""
    queried_box = _assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {"id": "67"}

    query = """query { box(labelIdentifier: "728544") { state } }"""
    queried_box = _assert_successful_request(auth0_client, query)
    assert queried_box == {"state": "Donated"}

    for resource in [
        "bases",
        "organisations",
        "users",
        "locations",
        "productCategories",
        "transferAgreements",
        "shipments",
    ]:
        query = f"query {{ {resource} {{ id }} }}"
        response = _assert_successful_request(auth0_client, query, field=resource)
        assert len(response) > 0

    for resource in ["beneficiaries", "products"]:
        query = f"query {{ {resource} {{ elements {{ id }} }} }}"
        response = _assert_successful_request(auth0_client, query, field=resource)
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
                    registered: false
                }) { id firstName } }"""
    response = assert_successful_request(auth0_client, mutation)
    beneficiary_id = response.pop("id")
    assert response == {"firstName": "Any"}

    mutation = f"""mutation {{ updateBeneficiary(updateInput: {{
                    id: {beneficiary_id}, firstName: "Some"
                    }}) {{ firstName }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"firstName": "Some"}

    mutation = """mutation { createTransferAgreement(creationInput: {
                    targetOrganisationId: 2,
                    type: Bidirectional
                }) { id type } }"""
    response = assert_successful_request(auth0_client, mutation)
    agreement_id = response.pop("id")
    assert response == {"type": "Bidirectional"}

    mutation = f"mutation {{ cancelTransferAgreement(id: {agreement_id}) {{ id }} }}"
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"id": str(agreement_id)}

    def create_shipment():
        mutation = """mutation { createShipment(creationInput: {
                        transferAgreementId: 1,
                        sourceBaseId: 1,
                        targetBaseId: 3
                    }) { id state } }"""
        response = assert_successful_request(auth0_client, mutation)
        shipment_id = response.pop("id")
        assert response == {"state": "Preparing"}
        return shipment_id

    shipment_id = create_shipment()
    mutation = f"""mutation {{ updateShipment(updateInput: {{
                    id: {shipment_id} }}) {{ id }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"id": str(shipment_id)}

    mutation = f"""mutation {{ sendShipment(id: {shipment_id}) {{ state }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"state": "Sent"}

    shipment_id = create_shipment()
    mutation = f"""mutation {{ cancelShipment(id: {shipment_id}) {{ state }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"state": "Canceled"}
