import pytest
from auth import (
    TEST_AUTH0_AUDIENCE,
    TEST_AUTH0_DOMAIN,
    fetch_token,
    get_authorization_header,
)
from boxtribute_server.auth import CurrentUser, decode_jwt, get_public_key
from utils import assert_forbidden_request, assert_successful_request


@pytest.mark.parametrize("endpoint", ["", "graphql"])
def test_queries(auth0_client, endpoint):
    def _assert_successful_request(*args, **kwargs):
        return assert_successful_request(*args, **kwargs, endpoint=endpoint)

    query = """query BoxIdAndItems {
                qrCode(qrCode: "9627242265f5a7f3a1db910eb18410f") { box { id } }
            }"""
    queried_box = _assert_successful_request(auth0_client, query)["box"]
    assert queried_box == {"id": "735"}

    query = """query { box(labelIdentifier: "177892") { state size { id } } }"""
    queried_box = _assert_successful_request(auth0_client, query)
    assert queried_box == {"state": "Donated", "size": {"id": "68"}}

    query = """query { beneficiary(id: 100000007) { age dateOfBirth } }"""
    queried_beneficiary = _assert_successful_request(auth0_client, query)
    assert queried_beneficiary == {"age": None, "dateOfBirth": None}

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
                }) { location { id } } }"""
    response = assert_successful_request(auth0_client, mutation)
    assert response == {"location": {"id": "1"}}

    mutation = """mutation { updateBox(updateInput: {
                    labelIdentifier: "177892", numberOfItems: 2
                }) { numberOfItems } }"""
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


# Test user data in dropapp_dev database:
# users: Volunteer - Coordinator - Head of Operations
# BoxAid (ID 1): SINGLE-BASE in Lesvos (1); users 7, 8, 9
# BoxCare (ID 2): MULTI-BASE in Samos (3) and Thessaloniki (2); users 16, 17, 18
BOX_AID_ID = "1"
BOX_CARE_ID = "2"
LESVOS_ID = "1"
THESSALONIKI_ID = "2"
SAMOS_ID = "3"


@pytest.mark.parametrize(
    "username,opposite_organisation_id",
    [
        ["dev_headofops@boxaid.org", BOX_CARE_ID],
        ["dev_headofops@boxcare.org", BOX_AID_ID],
        ["dev_coordinator@boxaid.org", BOX_CARE_ID],
        ["dev_coordinator@boxcare.org", BOX_AID_ID],
        ["dev_volunteer@boxaid.org", BOX_CARE_ID],
        ["dev_volunteer@boxcare.org", BOX_AID_ID],
    ],
)
def test_usergroup_permissions(dropapp_dev_client, username, opposite_organisation_id):
    dropapp_dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        username
    )

    if opposite_organisation_id == BOX_CARE_ID:
        expected_accessible_base_ids = [LESVOS_ID]
        expected_forbidden_base_ids = [THESSALONIKI_ID, SAMOS_ID]
    elif opposite_organisation_id == BOX_AID_ID:
        expected_accessible_base_ids = [THESSALONIKI_ID, SAMOS_ID]
        expected_forbidden_base_ids = [LESVOS_ID]

    # Verify that user does not have read permission to perform queries for fetching
    # other bases' beneficiaries
    query = f"""query {{ organisation(id: {opposite_organisation_id}) {{
                id bases {{ id beneficiaries {{ totalCount }} }} }} }}"""
    response = assert_forbidden_request(
        dropapp_dev_client,
        query,
        verify_response=False,
        error_count=len(expected_forbidden_base_ids),
    )
    organisation = response.json["data"]["organisation"]
    assert organisation == {
        "id": opposite_organisation_id,
        "bases": [
            {"id": i, "beneficiaries": None} for i in expected_forbidden_base_ids
        ],
    }
    for base_id in expected_forbidden_base_ids:
        query = f"query {{ base(id: {base_id}) {{ beneficiaries {{ totalCount }} }} }}"
        assert_forbidden_request(dropapp_dev_client, query)

    # Verify that user does not have create permission to perform mutation for creating
    # beneficiary in inaccessible base
    for base_id in expected_forbidden_base_ids:
        creation_input = f"""creationInput: {{
                firstName: "First"
                lastName: "Last"
                baseId: {base_id}
                groupIdentifier: "112233"
                dateOfBirth: "2000-01-01"
                gender: Male
                isVolunteer: false
                registered: true
            }}"""
        mutation = f"mutation {{ createBeneficiary({creation_input}) {{ id }} }}"
        assert_forbidden_request(dropapp_dev_client, mutation)

    # Verify base-specific permissions for user.
    # - users have read-access only to beneficiaries within their bases
    # - users have write-access only if allowed for their usergroup AND only to
    # beneficiaries within their bases
    domain = TEST_AUTH0_DOMAIN
    payload = decode_jwt(
        token=fetch_token(username),
        public_key=get_public_key(domain),
        domain=domain,
        audience=TEST_AUTH0_AUDIENCE,
    )
    user = CurrentUser.from_jwt(payload)
    assert user.authorized_base_ids("beneficiary:read") == [
        int(i) for i in expected_accessible_base_ids
    ]
    for permission in ["beneficiary:create", "beneficiary:edit"]:
        try:
            granted_base_ids = user.authorized_base_ids(permission)
        except KeyError:
            # Coordinator and Volunteer usergroups don't have write permissions
            granted_base_ids = []
        assert all(i not in granted_base_ids for i in expected_forbidden_base_ids)
