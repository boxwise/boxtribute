import peewee
import pytest
from auth import create_jwt_payload
from utils import assert_bad_user_input, assert_internal_server_error


def test_base_specific_permissions(client, mocker):
    """Verify that a user can only create beneficiary if base-specific permission
    available. QR codes can be created regardless of any base but for the front-end the
    base-specific distinction is relevant.
    """
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        organisation_id=2,
        user_id=1,
        permissions=[
            "base_2/qr:create",
            "stock:write",
            "base_3/beneficiary:create",
        ],
    )

    create_beneficiary_for_base2_mutation = """createBeneficiary(
                creationInput : {
                    firstName: "First",
                    lastName: "Last",
                    dateOfBirth: "1990-09-01",
                    baseId: 2,
                    groupIdentifier: "1312",
                    gender: Male,
                    languages: [de],
                    isVolunteer: true,
                    registered: false
                }) {
                id
            }"""
    create_beneficiary_for_base3_mutation = (
        create_beneficiary_for_base2_mutation.replace("baseId: 2", "baseId: 3")
    )
    data = {
        "query": f"""mutation {{
            bene2: {create_beneficiary_for_base2_mutation}
            bene3: {create_beneficiary_for_base3_mutation}
        }}"""
    }

    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["bene2"] is None
    assert response.json["data"]["bene3"] is not None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
    assert response.json["errors"][0]["path"] == ["bene2"]

    data = {
        "query": """mutation {
            qr2: createQrCode { code }
            qr3: createQrCode { code }
        }"""
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["qr2"] is not None
    assert response.json["data"]["qr3"] is not None
    assert "errors" not in response.json


def test_invalid_pagination_input(read_only_client):
    query = """query { beneficiaries(paginationInput: {last: 2}) {
        elements { id }
    } }"""
    assert_bad_user_input(read_only_client, query, none_data=True)


@pytest.mark.parametrize(
    "resource",
    [
        # Test case 9.1.5
        "beneficiary",
        # Test case 8.1.11
        "location",
        # Test case 8.1.22
        "product",
        # Test case 99.1.12
        "productCategory",
        # Test case 3.1.3
        "shipment",
        # Test case 4.1.3
        "tag",
        # Test case 2.1.4
        "transferAgreement",
        # Test case 99.1.9a
        "organisation",
    ],
)
def test_query_non_existent_resource(read_only_client, resource):
    query = f"query {{ {resource}(id: 0) {{ id }} }}"
    response = assert_bad_user_input(read_only_client, query, field=resource)
    assert "SQL" not in response.json["errors"][0]["message"]


def test_query_non_existent_box(read_only_client):
    # Test case 8.1.2
    query = """query { box(labelIdentifier: "000") { id } }"""
    response = assert_bad_user_input(read_only_client, query)
    assert "SQL" not in response.json["errors"][0]["message"]


def test_query_non_existent_qr_code(read_only_client):
    # Test case 8.1.31
    query = """query { qrCode(qrCode: "-1") { id } }"""
    response = assert_bad_user_input(read_only_client, query)
    assert "SQL" not in response.json["errors"][0]["message"]


@pytest.mark.parametrize("resource", ["base", "organisation", "user"])
def test_query_non_existent_resource_for_god_user(read_only_client, mocker, resource):
    # Test case 99.1.3, 10.1.3
    # Non-god users would not be authorized to access resource ID 0
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(permissions=["*"])
    query = f"query {{ {resource}(id: 0) {{ id }} }}"
    response = assert_bad_user_input(read_only_client, query, field=resource)
    assert "SQL" not in response.json["errors"][0]["message"]


@pytest.mark.parametrize(
    "operation",
    [
        "acceptTransferAgreement",
        "rejectTransferAgreement",
        "cancelTransferAgreement",
        "cancelShipment",
        "sendShipment",
        "deleteTag",
    ],
)
def test_mutation_non_existent_resource(read_only_client, operation):
    # Test cases 2.2.4, 2.2.6, 2.2.8, 3.2.8, 3.2.12, 4.2.10
    mutation = f"mutation {{ {operation}(id: 0) {{ id }} }}"
    response = assert_bad_user_input(read_only_client, mutation, field=operation)
    assert "SQL" not in response.json["errors"][0]["message"]


@pytest.mark.parametrize(
    "operation,mutation_input,field",
    [
        # Test case 8.2.20
        ["updateBox", """updateInput: { labelIdentifier: "xxx" }""", "id"],
        # Test case 9.2.14
        ["updateBeneficiary", "updateInput: { id: 0 }", "id"],
        # Test case 3.2.21
        ["updateShipment", "updateInput: { id: 0 }", "id"],
        # Test case 4.2.5
        ["updateTag", "updateInput: { id: 0 }", "id"],
        # Test case 4.2.15
        [
            "assignTag",
            "assignmentInput: { id: 0, resourceId: 2, resourceType: Box }",
            "...on Box { id }",
        ],
        # Test case 4.2.16
        [
            "assignTag",
            "assignmentInput: { id: 0, resourceId: 2, resourceType: Beneficiary }",
            "...on Beneficiary { id }",
        ],
        # Test case 4.2.17
        [
            "assignTag",
            "assignmentInput: { id: 2, resourceId: 0, resourceType: Box }",
            "...on Box { id }",
        ],
        # Test case 4.2.18
        [
            "assignTag",
            "assignmentInput: { id: 1, resourceId: 0, resourceType: Beneficiary }",
            "...on Beneficiary { id }",
        ],
        # Test case 4.2.29
        [
            "unassignTag",
            "unassignmentInput: { id: 0, resourceId: 2, resourceType: Box }",
            "...on Box { id }",
        ],
        # Test case 4.2.30
        [
            "unassignTag",
            "unassignmentInput: { id: 0, resourceId: 2, resourceType: Beneficiary }",
            "...on Beneficiary { id }",
        ],
        # Test case 4.2.31
        [
            "unassignTag",
            "unassignmentInput: { id: 2, resourceId: 0, resourceType: Box }",
            "...on Box { id }",
        ],
        # Test case 4.2.32
        [
            "unassignTag",
            "unassignmentInput: { id: 2, resourceId: 0, resourceType: Beneficiary }",
            "...on Beneficiary { id }",
        ],
    ],
)
def test_update_non_existent_resource(
    read_only_client, operation, mutation_input, field
):
    mutation = f"mutation {{ {operation}({mutation_input}) {{ {field} }} }}"
    response = assert_bad_user_input(read_only_client, mutation, field=operation)
    assert "SQL" not in response.json["errors"][0]["message"]


def test_mutation_arbitrary_database_error(read_only_client, mocker):
    mocker.patch(
        "boxtribute_server.warehouse.qr_code.mutations.create_qr_code"
    ).side_effect = peewee.PeeweeException
    mutation = "mutation { createQrCode { id } }"
    assert_internal_server_error(read_only_client, mutation, field="createQrCode")


@pytest.mark.parametrize(
    "origin,illegal,headers,methods",
    [
        ["https://illegal-origin.org", True, None, None],
        ["http://localhost:3000", False, "Authorization", "POST"],
        ["https://v2-staging.boxtribute.org", False, "Authorization", "POST"],
        [
            "https://v2-production-dot-dropapp-242214.ew.r.appspot.com",
            False,
            "Authorization",
            "POST",
        ],
    ],
)
def test_cors_preflight_request(read_only_client, origin, illegal, headers, methods):
    # Simulate CORS preflight request
    response = read_only_client.options(
        "/graphql",
        headers=[
            ("origin", origin),
            ("Access-Control-Request-Method", "POST"),
            ("Access-Control-Request-Headers", "Authorization"),
        ],
    )
    assert response.status_code == 200
    if illegal:
        assert response.headers.get("Access-Control-Allow-Origin") is None
    else:
        assert response.headers.get("Access-Control-Allow-Origin") == origin
    assert response.headers.get("Access-Control-Allow-Headers") == headers
    assert response.headers.get("Access-Control-Allow-Methods") == methods
