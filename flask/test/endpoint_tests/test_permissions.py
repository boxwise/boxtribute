import pytest
from auth import create_jwt_payload


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
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"

    data = {"query": f"""query {{ {resource}(id: 3) {{ id }} }}"""}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"][resource] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


def operation_name(operation):
    """Extract operation name from given string. The name is assumed to be the first
    word, followed by ( or whitespace.
    """
    return operation.split(" ")[0].strip("(\n")


@pytest.mark.parametrize(
    "query",
    [
        """box( boxLabelIdentifier: "c0ffee") { id }""",
    ],
    ids=operation_name,
)
def test_invalid_permission(unauthorized_client, query):
    """Verify missing resource:read permission."""
    data = {"query": f"query {{ {query} }}"}
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"][operation_name(query)] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


@pytest.mark.parametrize(
    "query",
    [
        """base( id: 0 ) { id }""",
        """organisation( id: 0 ) { id }""",
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
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"][operation_name(query)] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


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
    response = unauthorized_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"][operation_name(mutation)] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"
