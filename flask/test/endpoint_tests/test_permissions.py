import pytest
from auth import create_jwt_payload


def assert_forbidden_request(data, client_fixture=None, field=None, value=None):
    """Assertion utility that posts the given data via a client fixture.
    Afterwards verifies response field containing error information. If specified, the
    response data field named `field` is verified against an expected `value` (default
    None).
    """
    response = client_fixture.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
    if field is None:
        assert response.json["data"] is None
    else:
        if value is None:
            assert response.json["data"][field] is None
        else:
            assert response.json["data"][field] == value


@pytest.mark.parametrize(
    "resource",
    ["base", "beneficiary", "location", "product", "productCategory", "user"],
)
def test_invalid_read_permissions(unauthorized_client, resource):
    """Verify missing resource:read permission when executing query."""
    # Build plural form
    resources = f"{resource}s"
    if resource.endswith("y"):
        resources = f"{resource[:-1]}ies"

    data = {"query": f"""query {{ {resources} {{ id }} }}"""}
    if resources == "beneficiaries":
        data = {"query": "query { beneficiaries { elements { id } } }"}
    assert_forbidden_request(data, unauthorized_client)

    data = {"query": f"""query {{ {resource}(id: 3) {{ id }} }}"""}
    assert_forbidden_request(data, unauthorized_client, field=resource)


def operation_name(operation):
    """Extract operation name from given string. The name is assumed to be the first
    word, followed by ( or whitespace.
    """
    return operation.split(" ")[0].strip("(\n")


@pytest.mark.parametrize(
    "query",
    [
        """box( boxLabelIdentifier: "c0ffee") { id }""",
        """qrCode( qrCode: "1337beef" ) { id }""",
        """qrExists( qrCode: "1337beef" )""",
    ],
    ids=operation_name,
)
def test_invalid_permission(unauthorized_client, query):
    """Verify missing resource:read permission."""
    data = {"query": f"query {{ {query} }}"}
    assert_forbidden_request(data, unauthorized_client, field=operation_name(query))


@pytest.mark.parametrize(
    "query",
    [
        """base( id: 0 ) { id }""",
        """organisation( id: 0 ) { id }""",
        """location( id: 3 ) { id }""",  # ID of another_location fixture
    ],
    ids=operation_name,
)
def test_invalid_permission_for_given_resource_id(client, mocker, query):
    """Verify missing resource:read permission, or missing permission to access
    specified resource (base or organisation).
    """
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["base:read"], base_ids=[1], organisation_id=1
    )
    data = {"query": f"query {{ {query} }}"}
    assert_forbidden_request(data, client, field=operation_name(query))


@pytest.mark.parametrize(
    "mutation",
    [
        """createBeneficiary(
            beneficiaryCreationInput : {
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
            beneficiaryUpdateInput : {
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
                boxLabelIdentifier: "f00b45",
                comment: "let's try"
            }) {
            id
        }""",
        "createQrCode { id }",
    ],
    ids=operation_name,
)
def test_invalid_write_permission(unauthorized_client, mutation):
    """Verify missing resource:write permission when executing mutation."""
    data = {"query": f"mutation {{ {mutation} }}"}
    assert_forbidden_request(data, unauthorized_client, field=operation_name(mutation))


def test_invalid_permission_for_location_boxes(client, mocker):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["location:read"]
    )
    data = {"query": "query { location(id: 1) { boxes { id } } }"}
    assert_forbidden_request(data, client, field="location", value={"boxes": None})


def test_invalid_permission_for_qr_code_box(client, mocker, default_qr_code):
    # verify missing stock:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["qr:read"]
    )
    code = default_qr_code["code"]
    data = {"query": f"""query {{ qrCode(qrCode: "{code}") {{ box {{ id }} }} }}"""}
    assert_forbidden_request(data, client, field="qrCode", value={"box": None})


def test_invalid_permission_for_organisation_bases(
    unauthorized_client, default_organisation
):
    # verify missing base:read permission
    org_id = default_organisation["id"]
    data = {
        "query": f"""query {{ organisation(id: "{org_id}") {{ bases {{ id }} }} }}"""
    }
    assert_forbidden_request(
        data, unauthorized_client, field="organisation", value={"bases": None}
    )


def test_invalid_permission_for_beneficiary_tokens(client, mocker):
    # verify missing transaction:read permission
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        permissions=["beneficiary:read"]
    )
    data = {"query": "query { beneficiary(id: 3) { tokens } }"}
    assert_forbidden_request(data, client, field="beneficiary", value={"tokens": None})
