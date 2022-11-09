import os

import pytest
from auth import (
    TEST_AUTH0_AUDIENCE,
    TEST_AUTH0_DOMAIN,
    fetch_token,
    get_authorization_header,
)
from boxtribute_server.auth import CurrentUser, decode_jwt, get_public_key
from utils import assert_forbidden_request, assert_successful_request

# Test user data in dropapp_dev database:
# users: Volunteer - Coordinator - Head of Operations
# BoxAid (ID 1): SINGLE-BASE in Lesvos (1); users 7, 8, 9
# BoxCare (ID 2): MULTI-BASE in Samos (3) and Thessaloniki (2); users 16, 17, 18
BOX_AID_ID = "1"
BOX_CARE_ID = "2"
LESVOS_ID = "1"
THESSALONIKI_ID = "2"
SAMOS_ID = "3"
LESVOS_BENEFICIARY_ID = "1"
SAMOS_BENEFICIARY_ID = "1005"


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
def test_usergroup_cross_organisation_permissions(
    dropapp_dev_client, username, opposite_organisation_id
):
    dropapp_dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        username
    )

    if opposite_organisation_id == BOX_CARE_ID:
        expected_accessible_base_ids = [LESVOS_ID]
        expected_forbidden_base_ids = [THESSALONIKI_ID, SAMOS_ID]
        forbidden_beneficiary_id = SAMOS_BENEFICIARY_ID
    elif opposite_organisation_id == BOX_AID_ID:
        expected_accessible_base_ids = [THESSALONIKI_ID, SAMOS_ID]
        expected_forbidden_base_ids = [LESVOS_ID]
        forbidden_beneficiary_id = LESVOS_BENEFICIARY_ID

    # Verify that user does not have read permission to perform queries for fetching
    # other bases' beneficiaries
    # Test cases P1.1.1, P1.2.1, P1.3.1, P1.4.1, P1.5.1, P1.6.1
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
    # Test cases P1.1.2, P1.2.2, P1.3.2, P1.4.2, P1.5.2, P1.6.2
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

    # Verify that user does not have edit permission to perform mutation for updating
    # beneficiary in inaccessible base
    # Test cases P1.1.3, P1.2.3, P1.3.3, P1.4.3, P1.5.3, P1.6.3
    update_input = f"""updateInput: {{
        id: {forbidden_beneficiary_id}
        isVolunteer: true
    }}
    """
    mutation = f"mutation {{ updateBeneficiary({update_input}) {{ id }} }}"
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


def test_check_beta_feature_access(dropapp_dev_client, mocker):
    # Enable testing of check_beta_feature_access() function
    env_variables = os.environ.copy()
    env_variables["CI"] = "false"
    del env_variables["ENVIRONMENT"]
    mocker.patch("os.environ", env_variables)

    dropapp_dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        "dev_coordinator@boxaid.org"
    )

    mutation = "mutation { createQrCode { id } }"
    assert_successful_request(dropapp_dev_client, mutation)

    mutation = "mutation { deleteTag(id: 1) { id } }"
    data = {"query": mutation}
    response = dropapp_dev_client.post("/graphql", json=data)
    assert response.status_code == 401
    assert response.json["error"] == "No permission to access beta feature"
