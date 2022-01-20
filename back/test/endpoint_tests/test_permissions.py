import pytest
from auth import create_jwt_payload
from utils import assert_forbidden_request, assert_successful_request


@pytest.mark.parametrize(
    "resource",
    [
        "base",
        "beneficiary",
        "location",
        "product",
        "productCategory",
        "shipment",
        "transferAgreement",
        "user",
    ],
)
def test_invalid_read_permissions(unauthorized, read_only_client, resource):
    """Verify missing resource:read permission when executing query."""
    # Build plural form
    resources = f"{resource}s"
    if resource.endswith("y"):
        resources = f"{resource[:-1]}ies"

    query = f"""query {{ {resources} {{ id }} }}"""
    if resources == "beneficiaries":
        query = "query { beneficiaries { elements { id } } }"
    elif resources == "products":
        query = "query { products { elements { id } } }"
    assert_forbidden_request(read_only_client, query, none_data=True)

    query = f"""query {{ {resource}(id: 2) {{ id }} }}"""
    assert_forbidden_request(read_only_client, query)


def operation_name(operation):
    """Extract operation name from given string. The name is assumed to be the first
    word, followed by ( or whitespace.
    """
    return operation.split(" ")[0].strip("(\n")


@pytest.mark.parametrize(
    "query",
    [
        """box( labelIdentifier: "12345678") { id }""",
        """qrCode( qrCode: "1337beef" ) { id }""",
        """qrExists( qrCode: "1337beef" )""",
    ],
    ids=operation_name,
)
def test_invalid_permission(unauthorized, read_only_client, query):
    """Verify missing resource:read permission."""
    assert_forbidden_request(read_only_client, f"query {{ {query} }}")


@pytest.mark.parametrize(
    "query",
    [
        """base( id: 0 ) { id }""",
        """organisation( id: 0 ) { id }""",
        """location( id: 2 ) { id }""",  # ID of another_location fixture
    ],
    ids=operation_name,
)
def test_invalid_permission_for_given_resource_id(read_only_client, mocker, query):
    """Verify missing resource:read permission, or missing permission to access
    specified resource (base or organisation).
    """
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["base_1/base:read"], organisation_id=1
    )
    assert_forbidden_request(read_only_client, f"query {{ {query} }}")


@pytest.mark.parametrize(
    "mutation",
    [
        """createBeneficiary(
            creationInput : {
                firstName: "First",
                lastName: "Last",
                dateOfBirth: "1990-09-01",
                baseId: 2,
                groupIdentifier: "1312",
                gender: Male,
                languages: [de],
                isVolunteer: true,
                isRegistered: false
            }) {
            id
        }""",
        """updateBeneficiary(
            updateInput : {
                id: 3,
                firstName: "First"
            }) {
            id
        }""",
        """createBox(
            boxCreationInput : {
                productId: 1,
                items: 9999,
                locationId: 1,
                comment: ""
            }) {
            id
        }""",
        """updateBox(
            boxUpdateInput : {
                labelIdentifier: "f00b45",
                comment: "let's try"
            }) {
            id
        }""",
        "createQrCode { id }",
        """createTransferAgreement(
            creationInput : {
                targetOrganisationId: 2,
                type: Bidirectional
            }) { id }""",
        "acceptTransferAgreement( id: 1 ) { id }",
        "rejectTransferAgreement( id: 1 ) { id }",
        "cancelTransferAgreement( id: 1 ) { id }",
        """createShipment(
            creationInput : {
                sourceBaseId: 1,
                targetBaseId: 3,
                transferAgreementId: 1
            }) { id }""",
        "updateShipment( updateInput : { id: 1 }) { id }",
        "cancelShipment( id : 1 ) { id }",
        "sendShipment( id : 1 ) { id }",
    ],
    ids=operation_name,
)
def test_invalid_write_permission(unauthorized, read_only_client, mutation):
    """Verify missing resource:write permission when executing mutation."""
    assert_forbidden_request(
        read_only_client, f"mutation {{ {mutation} }}", field=operation_name(mutation)
    )


def test_invalid_permission_for_location_boxes(read_only_client, mocker):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["location:read"]
    )
    query = "query { location(id: 1) { boxes { elements { id } } } }"
    assert_forbidden_request(read_only_client, query, value={"boxes": None})


def test_invalid_permission_for_qr_code_box(read_only_client, mocker, default_qr_code):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["qr:read"]
    )
    code = default_qr_code["code"]
    query = f"""query {{ qrCode(qrCode: "{code}") {{ box {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={"box": None})


def test_invalid_permission_for_organisation_bases(
    unauthorized, read_only_client, default_organisation
):
    # verify missing base:read permission
    org_id = default_organisation["id"]
    query = f"""query {{ organisation(id: "{org_id}") {{ bases {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={"bases": None})


def test_invalid_permission_for_beneficiary_tokens(
    read_only_client, mocker, default_beneficiary
):
    # verify missing transaction:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["beneficiary:read"]
    )
    id = default_beneficiary["id"]
    query = f"query {{ beneficiary(id: {id}) {{ tokens }} }}"
    assert_forbidden_request(read_only_client, query, value={"tokens": None})


def test_invalid_permission_for_base_locations(read_only_client, mocker):
    # verify missing location:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["base:read"]
    )
    query = "query { base(id: 1) { locations { id } } }"
    assert_forbidden_request(read_only_client, query, value={"locations": None})


def test_invalid_permission_for_box_location(read_only_client, mocker, default_box):
    # verify missing location:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["stock:read"]
    )
    query = f"""query {{ box(labelIdentifier: "{default_box["label_identifier"]}")
                {{ location {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={"location": None})


@pytest.mark.parametrize(
    "method",
    ["read", "write", "edit"],
    ids=["all-bases", "write-implies-read", "edit-implies-read"],
)
def test_permission_scope(read_only_client, mocker, default_bases, method):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=[f"base:{method}"]
    )
    query = "query { bases { id } }"
    bases = assert_successful_request(read_only_client, query)
    assert len(bases) == len(default_bases)


def test_permission_for_god_user(read_only_client, mocker, default_users):
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(permissions=["*"])
    query = "query { users { id } }"
    users = assert_successful_request(read_only_client, query)
    assert len(users) == len(default_users)
