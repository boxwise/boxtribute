import pytest
from auth import (
    TEST_AUTH0_AUDIENCE,
    TEST_AUTH0_DOMAIN,
    fetch_token,
    get_authorization_header,
)
from boxtribute_server.auth import CurrentUser, decode_jwt, get_public_key
from utils import assert_forbidden_request

# Test user data in dropapp_dev database:
# users: Volunteer - Coordinator - Head of Operations
# BoxAid (ID 1): SINGLE-BASE in Lesvos (1); users 7, 8, 9
# BoxCare (ID 2): MULTI-BASE in Samos (3), Thessaloniki (2), Athens (4);
#    users 16 (bases 2+3), 17 (2+3), 18 (2+3+4), 19 (2), 20 (2)
BOX_AID_ID = "1"
BOX_CARE_ID = "2"
LESVOS_ID = "1"
THESSALONIKI_ID = "2"
SAMOS_ID = "3"
ATHENS_ID = "4"
LESVOS_BENEFICIARY_ID = "1"
SAMOS_BENEFICIARY_ID = "100000484"
ATHENS_BENEFICIARY_ID = "100000485"


@pytest.mark.parametrize(
    [
        "username",
        "opposite_organisation_id",
        "expected_accessible_base_ids",
        "expected_forbidden_base_ids",
        "forbidden_beneficiary_id",
    ],
    [
        [
            "dev_headofops@boxaid.org",
            BOX_CARE_ID,
            [LESVOS_ID],
            [THESSALONIKI_ID, SAMOS_ID, ATHENS_ID],
            SAMOS_BENEFICIARY_ID,
        ],
        [
            "dev_headofops@boxcare.org",
            BOX_AID_ID,
            [THESSALONIKI_ID, SAMOS_ID, ATHENS_ID],
            [LESVOS_ID],
            LESVOS_BENEFICIARY_ID,
        ],
        [
            "dev_coordinator@boxaid.org",
            BOX_CARE_ID,
            [LESVOS_ID],
            [THESSALONIKI_ID, SAMOS_ID, ATHENS_ID],
            SAMOS_BENEFICIARY_ID,
        ],
        [
            "dev_coordinator@boxcare.org",
            BOX_AID_ID,
            [THESSALONIKI_ID, SAMOS_ID],
            [LESVOS_ID],
            LESVOS_BENEFICIARY_ID,
        ],
        [
            "dev_volunteer@boxaid.org",
            BOX_CARE_ID,
            [LESVOS_ID],
            [THESSALONIKI_ID, SAMOS_ID, ATHENS_ID],
            SAMOS_BENEFICIARY_ID,
        ],
        [
            "dev_volunteer@boxcare.org",
            BOX_AID_ID,
            [THESSALONIKI_ID, SAMOS_ID],
            [LESVOS_ID],
            LESVOS_BENEFICIARY_ID,
        ],
        # access within same organisation
        # Multi-base users
        [
            "dev_coordinator@boxcare.org",
            BOX_CARE_ID,
            [THESSALONIKI_ID, SAMOS_ID],
            [ATHENS_ID],
            ATHENS_BENEFICIARY_ID,
        ],
        [
            "dev_volunteer@boxcare.org",
            BOX_CARE_ID,
            [THESSALONIKI_ID, SAMOS_ID],
            [ATHENS_ID],
            ATHENS_BENEFICIARY_ID,
        ],
        # Single-base users
        [
            "another_dev_coordinatorr@boxcare.org",
            BOX_CARE_ID,
            [THESSALONIKI_ID],
            [SAMOS_ID, ATHENS_ID],
            SAMOS_BENEFICIARY_ID,
        ],
        [
            "another_dev_volunteer@boxcare.org",
            BOX_CARE_ID,
            [THESSALONIKI_ID],
            [SAMOS_ID, ATHENS_ID],
            SAMOS_BENEFICIARY_ID,
        ],
    ],
)
def test_usergroup_cross_organisation_permissions(
    dropapp_dev_client,
    username,
    opposite_organisation_id,
    expected_accessible_base_ids,
    expected_forbidden_base_ids,
    forbidden_beneficiary_id,
):
    dropapp_dev_client.environ_base["HTTP_AUTHORIZATION"] = get_authorization_header(
        username
    )

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
    if opposite_organisation_id == BOX_CARE_ID and "boxcare" in username:
        # In this scenario, the user tries to access another unauthorized base from the
        # same organisation they belong to. No beneficiary data returned for this base
        assert organisation["id"] == opposite_organisation_id
        bases = organisation["bases"]
        assert {"id": expected_forbidden_base_ids[0], "beneficiaries": None} in bases
        assert len(bases) == len(expected_forbidden_base_ids) + len(
            expected_accessible_base_ids
        )
    else:
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
