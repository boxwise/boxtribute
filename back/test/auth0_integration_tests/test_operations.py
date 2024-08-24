from datetime import date

import pytest
from auth import get_authorization_header
from utils import assert_successful_request


@pytest.mark.parametrize("endpoint", ["", "graphql"])
def test_queries(auth0_client, endpoint):
    auth0_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        "coordinator@coordinator.co"
    )

    def _assert_successful_request(*args, **kwargs):
        return assert_successful_request(*args, **kwargs, endpoint=endpoint)

    query = """query BoxIdAndItems {
                qrCode(qrCode: "093f65e080a295f8076b1c5722a46aa2") { box { id } }
            }"""
    queried_box = _assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {"id": "100000000"}

    query = 'query { box(labelIdentifier: "328765") { deletedOn state size { id } } }'
    queried_box = _assert_successful_request(auth0_client, query)
    assert queried_box == {"state": "Donated", "size": {"id": "68"}, "deletedOn": None}

    query = """query { beneficiary(id: 100000001) { dateOfBirth } }"""
    queried_beneficiary = _assert_successful_request(auth0_client, query)
    assert queried_beneficiary == {"dateOfBirth": "1980-07-10"}

    query = """query { base(id: 100000000) { products { id } } }"""
    response = _assert_successful_request(auth0_client, query)
    assert len(response["products"]) == 7

    query = "query { beneficiaryDemographics(baseId: 100000000) { facts { count } } }"
    demographics = _assert_successful_request(auth0_client, query)
    assert sum(group["count"] for group in demographics["facts"]) == 6

    auth0_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        "some.admin@boxtribute.org"
    )
    for resource, count in zip(
        [
            "bases",
            "organisations",
            "locations",
            "productCategories",
            "tags",
            "transferAgreements",
            "shipments",
            "users",
        ],
        [6, 4, 31, 18, 72, 5, 6, 43],
    ):
        query = f"query {{ {resource} {{ id }} }}"
        response = _assert_successful_request(auth0_client, query, field=resource)
        assert len(response) == count

    for resource, count in zip(["beneficiaries", "products"], [469, 312]):
        query = f"query {{ {resource} {{ totalCount }} }}"
        response = _assert_successful_request(auth0_client, query, field=resource)
        assert response["totalCount"] == count

    query = """query { standardProducts {
                ...on StandardProductPage { totalCount } } }"""
    response = _assert_successful_request(auth0_client, query)
    assert response["totalCount"] == 162


def test_mutations(auth0_client):
    auth0_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        "coordinator@coordinator.co"
    )
    user_id = "100000001"

    mutation = "mutation { createQrCode { id } }"
    response = assert_successful_request(auth0_client, mutation, field="createQrCode")
    assert response is not None

    mutation = """mutation { createBox(creationInput: {
                   productId: 1158,
                   numberOfItems: 10,
                   locationId: 100000000,
                   sizeId: 1,
                   comment: "new things"
                }) { labelIdentifier location { id } } }"""
    response = assert_successful_request(auth0_client, mutation)
    label_identifier = response.pop("labelIdentifier")
    assert response == {"location": {"id": "100000000"}}

    mutation = f"""mutation {{ updateBox(updateInput: {{
                    labelIdentifier: "{label_identifier}", numberOfItems: 2
                }}) {{ numberOfItems }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"numberOfItems": 2}

    mutation = """mutation { createBeneficiary(creationInput: {
                    firstName: "Any",
                    lastName: "Body",
                    baseId: 100000000,
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

    def create_shipment():
        mutation = """mutation { createShipment(creationInput: {
                        transferAgreementId: 1,
                        sourceBaseId: 100000000,
                        targetBaseId: 100000001
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
                    baseId: 100000000
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
        "base": {"id": "100000000"},
        "price": 0.0,
        "comment": None,
        "inShop": False,
        "createdBy": {"id": user_id},
    }

    agreement_id = 1
    mutation = f"mutation {{ cancelTransferAgreement(id: {agreement_id}) {{ id }} }}"
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"id": str(agreement_id)}

    mutation = """mutation { createTransferAgreement(creationInput: {
                    initiatingOrganisationId: 100000000,
                    partnerOrganisationId: 100000001,
                    initiatingOrganisationBaseIds: [100000000]
                    type: Bidirectional
                }) { id type } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"type": "Bidirectional", "id": "6"}

    mutation = """mutation { createCustomProduct(creationInput: {
                    name: "bags"
                    categoryId: 12
                    sizeRangeId: 1
                    gender: UnisexKid
                    baseId: 100000000
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
        "base": {"id": "100000000"},
        "price": 4.0,
        "comment": "good quality",
        "inShop": True,
        "createdBy": {"id": user_id},
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
    assert response == {
        "name": name,
        "inShop": False,
        "lastModifiedBy": {"id": user_id},
    }

    mutation = f"""mutation {{ deleteProduct(id: {product_id}) {{
                ...on Product {{ deletedOn }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    today = date.today().isoformat()
    assert response["deletedOn"].startswith(today)

    mutation = """mutation { enableStandardProduct(enableInput: {
                    standardProductId: 1, baseId: 100000000 } ) {
                ...on Product { id base { id } price createdOn } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response.pop("createdOn").startswith(today)
    product_id = response.pop("id")
    assert response == {"base": {"id": "100000000"}, "price": 0.0}

    mutation = f"""mutation {{ editStandardProductInstantiation(editInput: {{
                    id: {product_id}, price: 1 }} ) {{
                ...on Product {{ price }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"price": 1.0}

    mutation = f"""mutation {{ disableStandardProduct( instantiationId: {product_id} )
                {{ ...on Product {{ deletedOn }} }} }}"""
    response = assert_successful_request(auth0_client, mutation)
    assert response["deletedOn"].startswith(today)
