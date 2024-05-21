from datetime import date

import pytest
from utils import assert_successful_request


@pytest.mark.parametrize("endpoint", ["", "graphql"])
def test_queries(auth0_client, endpoint):
    def _assert_successful_request(*args, **kwargs):
        return assert_successful_request(*args, **kwargs, endpoint=endpoint)

    query = """query BoxIdAndItems {
                qrCode(qrCode: "9627242265f5a7f3a1db910eb18410f") { box { id } }
            }"""
    queried_box = _assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {"id": "1"}

    query = """query { box(labelIdentifier: "8889639") { state size { id } } }"""
    queried_box = _assert_successful_request(auth0_client, query)
    assert queried_box == {"state": "Donated", "size": {"id": "68"}}

    query = """query { beneficiary(id: 1000) { dateOfBirth } }"""
    queried_beneficiary = _assert_successful_request(auth0_client, query)
    assert queried_beneficiary == {"dateOfBirth": "1992-10-04"}

    for resource in [
        "bases",
        "organisations",
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

    query = """query { base(id: 1) { products { id } } }"""
    response = _assert_successful_request(auth0_client, query)
    assert len(response["products"]) == 216

    query = """query { base(id: 1) {
        products(filterInput: {includeDeleted: true}) { id } } }"""
    response = _assert_successful_request(auth0_client, query)
    assert len(response["products"]) == 219

    query = "query { beneficiaryDemographics(baseId: 1) { facts { age count } } }"
    demographics = _assert_successful_request(auth0_client, query)
    assert sum(group["count"] for group in demographics["facts"]) == 970

    query = """query { standardProducts {
                ...on StandardProductPage { elements { id } } } }"""
    response = _assert_successful_request(auth0_client, query)
    assert response == {"elements": [{"id": "1"}]}


def test_mutations(auth0_client):
    mutation = "mutation { createQrCode { id } }"
    response = assert_successful_request(auth0_client, mutation, field="createQrCode")
    assert response is not None

    mutation = """mutation { createBox(creationInput: {
                   productId: 1,
                   numberOfItems: 10,
                   locationId: 1,
                   sizeId: 1,
                   comment: "new things"
                }) { labelIdentifier location { id } } }"""
    response = assert_successful_request(auth0_client, mutation)
    label_identifier = response.pop("labelIdentifier")
    assert response == {"location": {"id": "1"}}

    mutation = f"""mutation {{ updateBox(updateInput: {{
                    labelIdentifier: "{label_identifier}", numberOfItems: 2
                }}) {{ numberOfItems }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"numberOfItems": 2}

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
                    initiatingOrganisationId: 1,
                    partnerOrganisationId: 100000000,
                    initiatingOrganisationBaseIds: [1]
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
    mutation = f"""mutation {{ updateShipmentWhenPreparing(updateInput: {{
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

    mutation = """mutation { createCustomProduct(creationInput: {
                    name: "bags"
                    categoryId: 12
                    sizeRangeId: 1
                    gender: UnisexKid
                    baseId: 1
                }) {
                ...on Product {
                    id
                    name
                    base { id }
                    price
                    comment
                    inShop
                    createdBy { id }
                } } }"""
    response = assert_successful_request(auth0_client, mutation)
    product_id = int(response.pop("id"))
    assert response == {
        "name": "bags",
        "base": {"id": "1"},
        "price": 0.0,
        "comment": None,
        "inShop": False,
        "createdBy": {"id": "8"},
    }

    mutation = """mutation { createCustomProduct(creationInput: {
                    name: "bags"
                    categoryId: 12
                    sizeRangeId: 1
                    gender: UnisexKid
                    baseId: 1
                    price: 4
                    comment: "good quality"
                    inShop: true
                }) {
                ...on Product {
                    id
                    name
                    base { id }
                    price
                    comment
                    inShop
                    createdBy { id }
                } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert int(response.pop("id")) == product_id + 1
    assert response == {
        "name": "bags",
        "base": {"id": "1"},
        "price": 4.0,
        "comment": "good quality",
        "inShop": True,
        "createdBy": {"id": "8"},
    }

    name = "bag"
    mutation = f"""mutation {{ editCustomProduct(editInput: {{
                    id: {product_id}, name: "{name}", inShop: false
                }}) {{
                ...on Product {{
                    name
                    inShop
                    lastModifiedBy {{ id }}
                }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"name": name, "inShop": False, "lastModifiedBy": {"id": "8"}}

    mutation = f"""mutation {{ deleteProduct(id: {product_id}) {{
                ...on Product {{ deletedOn }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    today = date.today().isoformat()
    assert response["deletedOn"].startswith(today)

    mutation = """mutation { enableStandardProduct(enableInput: {
                    standardProductId: 1, baseId: 1 } ) {
                ...on Product { id base { id } price createdOn } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response.pop("createdOn").startswith(today)
    product_id = response.pop("id")
    assert response == {"base": {"id": "1"}, "price": 0.0}

    mutation = f"""mutation {{ editStandardProductInstantiation(editInput: {{
                    id: {product_id}, price: 1 }} ) {{
                ...on Product {{ price }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"price": 1.0}

    mutation = f"""mutation {{ disableStandardProduct( instantiationId: {product_id} )
                {{ ...on Product {{ deletedOn }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response["deletedOn"].startswith(today)
