import pytest
from auth import mock_user_for_request
from utils import assert_forbidden_request, assert_successful_request


@pytest.mark.parametrize(
    "resource",
    [
        # Test cases 99.1.4, 99.1.6
        "base",
        # Test cases 9.1.6, 9.1.7
        "beneficiary",
        # Test cases 8.1.16, 8.1.17
        "location",
        # Test cases 99.1.9b, 99.1.9c
        "organisation",
        # Test cases 8.1.23, 8.1.25
        "product",
        # Test cases 99.1.13, 99.1.14
        "productCategory",
        # Test cases 3.1.4, 3.1.5
        "shipment",
        # Test cases 4.1.4, 4.1.6
        "tag",
        # Test cases 2.1.5, 2.1.6
        "transferAgreement",
        # Test cases 10.1.4, 10.1.6
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
        # Test case 8.1.3
        """box( labelIdentifier: "12345678") { id }""",
        # Test case 8.1.35
        """qrExists( code: "1337beef" )""",
    ],
    ids=operation_name,
)
def test_invalid_permission(unauthorized, read_only_client, query):
    """Verify missing resource:read permission."""
    assert_forbidden_request(read_only_client, f"query {{ {query} }}")


@pytest.mark.parametrize(
    "query",
    [
        # Test case 99.1.5
        """base( id: 2 ) { id }""",
        # Test case 8.1.18
        """location( id: 2 ) { id }""",  # ID of another_location fixture
        # Test case 4.1.5
        """tag( id: 4 ) { id }""",
        # Test case 8.1.4
        """box( labelIdentifier: "34567890" ) { id }""",
        # Test case 8.1.24
        """product( id: 2 ) { id }""",
        # Test case 9.1.8
        """beneficiary( id: 4 ) { id }""",
        """packingListEntry( id: 1 ) { id }""",
        # Test case 3.1.6
        """shipment( id: 5 ) { id }""",
    ],
    ids=operation_name,
)
def test_invalid_permission_for_given_resource_id(read_only_client, query):
    """Verify missing resource:read permission, or missing permission to access
    specified resource (i.e. base).
    """
    assert_forbidden_request(read_only_client, f"query {{ {query} }}")


@pytest.mark.parametrize(
    "mutation",
    [
        # Test case 9.2.6
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
                registered: false
            }) {
            id
        }""",
        # Test case 9.2.11
        """updateBeneficiary(
            updateInput : {
                id: 3,
                firstName: "First"
            }) {
            id
        }""",
        # Test case 9.2.21
        """deactivateBeneficiary( id: 3 ) { id }""",
        # Test case 8.2.9
        """createBox(
            creationInput : {
                productId: 1,
                numberOfItems: 9999,
                locationId: 1,
                sizeId: 1,
                comment: ""
            }) {
            id
        }""",
        # Test case 8.2.17
        """updateBox(
            updateInput : {
                labelIdentifier: "12345678",
                comment: "let's try"
            }) {
            id
        }""",
        # Test case 8.2.33
        "createQrCode { id }",
        """createTransferAgreement(
            creationInput : {
                initiatingOrganisationId: 1,
                partnerOrganisationId: 2,
                initiatingOrganisationBaseIds: [1]
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
        "updateShipmentWhenPreparing( updateInput : { id: 1 }) { id }",
        "updateShipmentWhenReceiving( updateInput : { id: 1 }) { id }",
        "cancelShipment( id : 1 ) { id }",
        "markShipmentAsLost( id : 1 ) { id }",
        "sendShipment( id : 1 ) { id }",
        "startReceivingShipment( id : 1 ) { id }",
        # Test case 4.2.8
        """createTag(
            creationInput : {
                name: "cool tag",
                color: "#aabbcc",
                type: All,
                baseId: 1
            }) { id }""",
        # Test case 4.2.7
        "updateTag( updateInput : { id: 1 }) { id }",
        # Test case 4.2.11
        "deleteTag( id: 1 ) { id }",
        # Test case 4.2.19, 4.2.20
        """assignTag(
            assignmentInput: {
                id: 1
                resourceId: 1
                resourceType: Box
            }) { ...on Box { id } }""",
        # Test case 4.2.33, 4.2.34
        """unassignTag(
            unassignmentInput: {
                id: 1
                resourceId: 1
                resourceType: Box
            }) { ...on Box { id } }""",
    ],
    ids=operation_name,
)
def test_invalid_write_permission(unauthorized, read_only_client, mutation):
    """Verify missing resource:write permission when executing mutation."""
    assert_forbidden_request(
        read_only_client, f"mutation {{ {mutation} }}", field=operation_name(mutation)
    )


@pytest.mark.parametrize(
    "mutation",
    [
        # test user does not have permission to access location ID 2 nor product ID 2
        # Test case 8.2.7
        """createBox(
            creationInput : {
                productId: 1,
                numberOfItems: 9999,
                locationId: 2,
                sizeId: 1,
                comment: ""
            }) { id }""",
        # Test case 8.2.8
        """createBox(
            creationInput : {
                productId: 2,
                numberOfItems: 9999,
                locationId: 1,
                sizeId: 1,
                comment: ""
            }) { id }""",
        # Test case 8.2.12
        """createBox(
            creationInput : {
                productId: 1,
                locationId: 1,
                sizeId: 1,
                tagIds: [4]
            }) { id }""",
        # Test case 8.2.18
        """updateBox(
            updateInput : { labelIdentifier: "34567890" }) { id }""",
        # Test case 8.2.16
        """updateBox(
            updateInput : {
                labelIdentifier: "12345678",
                locationId: 2
            }) { id }""",
        # Test case 8.2.15
        """updateBox(
            updateInput : {
                labelIdentifier: "12345678",
                productId: 2
            }) { id }""",
        # Test case 8.2.21
        """updateBox(
            updateInput : {
                labelIdentifier: "12345678",
                tagIds: [4]
            }) { id }""",
        # Test case 9.2.15
        """updateBeneficiary(
            updateInput : {
                id: 4,
                firstName: "First"
            }) {
            id
        }""",
        # Test case 9.2.22
        """deactivateBeneficiary( id: 4 ) { id }""",
        # Test case 3.2.4c
        """createShipment(
            creationInput : {
                sourceBaseId: 3,
                targetBaseId: 4
            }) { id }""",
        """createShipment(
            creationInput : {
                sourceBaseId: 3,
                targetBaseId: 1
            }) { id }""",
    ],
    ids=operation_name,
)
def test_invalid_permission_when_mutating_box(read_only_client, mutation):
    assert_forbidden_request(
        read_only_client, f"mutation {{ {mutation} }}", field=operation_name(mutation)
    )


def test_invalid_permission_when_creating_box_with_tags(read_only_client, mocker):
    # Test case 8.2.11
    # Verify missing tag_relation:assign permission
    mock_user_for_request(
        mocker, permissions=["location:read", "stock:write", "product:read"]
    )
    mutation = """mutation { createBox(
            creationInput : {
                productId: 1,
                locationId: 1,
                sizeId: 1,
                tagIds: [2]
            }) { id } }"""
    assert_forbidden_request(read_only_client, mutation)


def test_invalid_permission_for_location_boxes(read_only_client, mocker):
    # Test case 8.1.8
    # verify missing stock:read permission
    mock_user_for_request(mocker, permissions=["location:read"])
    query = "query { location(id: 1) { boxes { elements { id } } } }"
    assert_forbidden_request(read_only_client, query, value={"boxes": None})


def test_invalid_permission_for_qr_code_box(
    read_only_client,
    mocker,
    default_qr_code,
    another_qr_code_with_box,
    another_base,
    another_organisation,
):
    # Test case 8.1.10
    # Verify missing stock:read permission
    mock_user_for_request(mocker, permissions=["qr:read"])
    code = default_qr_code["code"]
    query = f"""query {{ qrCode(code: "{code}") {{
        ...on QrCode {{
            box {{ ...on InsufficientPermissionError {{ name }} }}
        }} }} }}"""
    response = assert_successful_request(read_only_client, query)
    assert response == {"box": {"name": "stock:read"}}

    # Test case 8.1.11
    # Verify missing base-specific stock:read permission (the QR code belongs to a box
    # from a base that the user is not authorized for. Hence it's especially prohibited
    # to access beneficiary data through a common tag)
    mock_user_for_request(
        mocker,
        permissions=[
            "qr:read",
            "stock:read",
            "tag:read",
            "tag_relation:read",
            "beneficiary:read",
        ],
        base_ids=[1],
    )
    code = another_qr_code_with_box["code"]  # the associated box is in base ID 3
    query = f"""query {{ qrCode(code: "{code}") {{
        ...on QrCode {{
            box {{
                ...on UnauthorizedForBaseError {{ id name organisationName }}
                ...on Box {{
                    tags {{ taggedResources {{ ...on Beneficiary {{ id }} }} }}
            }} }} }} }} }}"""
    response = assert_successful_request(read_only_client, query)
    assert response == {
        "box": {
            "id": "3",
            "name": another_base["name"],
            "organisationName": another_organisation["name"],
        }
    }


def test_invalid_permission_for_organisation_bases(
    read_only_client, mocker, default_organisation
):
    # verify missing base:read permission
    mock_user_for_request(mocker, permissions=["organisation:read"])
    org_id = default_organisation["id"]
    query = f"""query {{ organisation(id: "{org_id}") {{ bases {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={"bases": None})


def test_invalid_permission_for_beneficiary_fields(
    read_only_client, mocker, default_beneficiary
):
    # verify missing tag:read/transaction:read permission
    mock_user_for_request(mocker, permissions=["beneficiary:read"])
    id = default_beneficiary["id"]
    query = f"query {{ beneficiary(id: {id}) {{ tokens }} }}"
    assert_forbidden_request(read_only_client, query, value={"tokens": None})

    # Test case 4.1.8
    query = f"query {{ beneficiary(id: {id}) {{ tags {{ id }} }} }}"
    assert_forbidden_request(read_only_client, query, value={"tags": None})


def test_invalid_permission_for_base_locations(read_only_client, mocker):
    # verify missing location:read permission
    mock_user_for_request(mocker, permissions=["base:read"])
    query = "query { base(id: 1) { locations { id } } }"
    assert_forbidden_request(read_only_client, query, value=None)


def test_invalid_permission_for_tag_resources(read_only_client, mocker, tags):
    # Test case 4.1.7
    # verify missing tag_relation:read permission
    mock_user_for_request(mocker, permissions=["tag:read"])
    id = tags[0]["id"]
    query = f"query {{ tag(id: {id}) {{ taggedResources {{ ...on Box {{ id }} }} }} }}"
    assert_forbidden_request(read_only_client, query, value={"taggedResources": None})


@pytest.mark.parametrize("field", ["sourceBases", "targetBases"])
def test_invalid_permission_for_agreement_bases(read_only_client, mocker, field):
    # verify missing base:read permission
    mock_user_for_request(mocker, permissions=["transfer_agreement:read"])
    query = f"query {{ transferAgreement(id: 1) {{ {field} {{ id }} }} }}"
    assert_forbidden_request(read_only_client, query, value={field: None})


@pytest.mark.parametrize("field", ["sourceBase", "targetBase"])
def test_invalid_permission_for_shipment_base(read_only_client, mocker, field):
    # verify missing base:read permission
    mock_user_for_request(mocker, permissions=["shipment:read"])
    query = f"query {{ shipment(id: 1) {{ {field} {{ id }} }} }}"
    assert_forbidden_request(read_only_client, query)


@pytest.mark.parametrize("field", ["qrCode", "tags", "size"])
def test_invalid_permission_for_box_field(read_only_client, mocker, default_box, field):
    # Test case 8.1.9
    # verify missing field:read permission
    mock_user_for_request(mocker, permissions=["stock:read"])
    query = f"""query {{ box(labelIdentifier: "{default_box["label_identifier"]}")
                {{ {field} {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={field: None})


@pytest.mark.parametrize(
    "field", ["sourceLocation", "targetLocation", "sourceProduct", "targetProduct"]
)
def test_invalid_permission_for_shipment_details_field(
    read_only_client, mocker, default_box, field
):
    # verify missing field:read permission
    mock_user_for_request(mocker, permissions=["shipment:read", "shipment_detail:read"])
    query = f"""query {{ shipment(id: 1) {{ details
                {{ {field} {{ id }} }} }} }}"""
    assert_forbidden_request(
        read_only_client, query, value={"details": [{field: None}]}
    )


@pytest.mark.parametrize("resource", ["location", "product", "beneficiary"])
def test_invalid_permission_for_resource_base(
    read_only_client, mocker, default_product, resource
):
    # verify missing base:read permission
    mock_user_for_request(mocker, permissions=[f"{resource}:read"])
    query = f"""query {{ {resource}(id: 1)
                {{ base {{ id }} }} }}"""
    assert_forbidden_request(read_only_client, query, value={"base": None})


def test_invalid_permission_for_metrics(read_only_client, mocker):
    query = "query { metrics(organisationId: 2) { numberOfSales } }"
    assert_forbidden_request(read_only_client, query)


@pytest.mark.parametrize(
    "method",
    ["read", "write", "create", "edit", "delete"],
    ids=[
        "all-bases",
        "write-implies-read",
        "create-implies-read",
        "edit-implies-read",
        "delete-implies-read",
    ],
)
def test_permission_scope(read_only_client, mocker, method):
    mock_user_for_request(mocker, permissions=[f"base:{method}"])
    query = "query { bases { id } }"
    bases = assert_successful_request(read_only_client, query)
    assert bases == [{"id": "1"}]


def test_permission_for_god_user(
    read_only_client,
    mocker,
    default_users,
    products,
    shipments,
    transfer_agreements,
):
    mock_user_for_request(mocker, is_god=True)
    # Test case 10.1.1
    query = "query { users { id } }"
    users = assert_successful_request(read_only_client, query)
    assert len(users) == len(default_users)

    query = "query { products { totalCount } }"
    nr_products = assert_successful_request(read_only_client, query)["totalCount"]
    assert nr_products == len(products)

    query = "query { shipments { id } }"
    nr_shipments = len(assert_successful_request(read_only_client, query))
    assert nr_shipments == len(shipments)

    query = "query { transferAgreements { id } }"
    agreements = assert_successful_request(read_only_client, query)
    assert len(agreements) == len(transfer_agreements)


def test_invalid_permission_for_user_read(
    read_only_client, default_product, default_user
):
    product_id = default_product["id"]
    query = f"query {{ product(id: {product_id}) {{ createdBy {{ name email }} }} }}"
    assert_forbidden_request(
        read_only_client,
        query,
        value={"createdBy": {"email": None, "name": default_user["name"]}},
    )


@pytest.mark.parametrize(
    "operation,mutation_input,field,response",
    [
        # Test case 8.2.40
        [
            "createCustomProduct",
            """creationInput:
            { baseId: 1, name: "a", categoryId: 12, sizeRangeId: 1, gender: none}""",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.50
        [
            "editCustomProduct",
            "editInput: { id: 1, price: 20 }",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.58
        [
            "deleteProduct",
            "id: 1",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.66
        [
            "enableStandardProduct",
            """enableInput: { baseId: 1, standardProductId: 2 }""",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.74
        [
            "editStandardProductInstantiation",
            "editInput: { id: 5, price: 20 }",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.83
        [
            "disableStandardProduct",
            "instantiationId: 5",
            "...on InsufficientPermissionError { name }",
            {"name": "product:write"},
        ],
        # Test case 8.2.29
        [
            "deleteBoxes",
            'labelIdentifiers: ["12345678"]',
            "...on InsufficientPermissionError { name }",
            {"name": "stock:write"},
        ],
        # Test case 8.2.22e
        [
            "moveBoxesToLocation",
            'updateInput: { labelIdentifiers: ["12345678"], locationId: 1 }',
            "...on InsufficientPermissionError { name }",
            {"name": "stock:write"},
        ],
        # Test case 8.2.23e
        [
            "assignTagsToBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [2] }',
            "tagErrorInfo { id error { ...on InsufficientPermissionError { name } } }",
            {"tagErrorInfo": [{"error": {"name": "tag_relation:assign"}, "id": "2"}]},
        ],
        # Test case 8.2.24e
        [
            "unassignTagsFromBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [2] }',
            "tagErrorInfo { id error { ...on InsufficientPermissionError { name } } }",
            {"tagErrorInfo": [{"error": {"name": "tag_relation:assign"}, "id": "2"}]},
        ],
    ],
)
def test_mutate_insufficient_permission(
    unauthorized, read_only_client, operation, mutation_input, field, response
):
    mutation = f"mutation {{ {operation}({mutation_input}) {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, mutation)
    assert actual_response == response


@pytest.mark.parametrize(
    "operation,mutation_input,field,response",
    [
        # Test case 8.2.39
        [
            "createCustomProduct",
            """creationInput:
            { baseId: 2, name: "a", categoryId: 12, sizeRangeId: 1, gender: none}""",
            "...on UnauthorizedForBaseError { id }",
            {"id": "2"},
        ],
        # Test case 8.2.49
        [
            "editCustomProduct",
            "editInput: { id: 2, price: 20 }",
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
        # Test case 8.2.57
        [
            "deleteProduct",
            "id: 2",
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
        # Test case 8.2.65
        [
            "enableStandardProduct",
            """enableInput: { baseId: 2, standardProductId: 2 }""",
            "...on UnauthorizedForBaseError { id }",
            {"id": "2"},
        ],
        # Test case 8.2.73
        [
            "editStandardProductInstantiation",
            "editInput: { id: 7, price: 20 }",
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
        # Test case 8.2.82
        [
            "disableStandardProduct",
            "instantiationId: 7",
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
        # Test case 8.2.22f
        [
            "moveBoxesToLocation",
            'updateInput: { labelIdentifiers: ["12345678"], locationId: 2 }',
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
        # Test case 8.2.23f
        [
            "assignTagsToBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [4] }',
            "tagErrorInfo { id error { ...on UnauthorizedForBaseError { id } } }",
            {"tagErrorInfo": [{"error": {"id": "2"}, "id": "4"}]},
        ],
        # Test case 8.2.24f
        [
            "unassignTagsFromBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [4] }',
            "tagErrorInfo { id error { ...on UnauthorizedForBaseError { id } } }",
            {"tagErrorInfo": [{"error": {"id": "2"}, "id": "4"}]},
        ],
    ],
)
def test_mutate_unauthorized_for_base(
    read_only_client, operation, mutation_input, field, response
):
    mutation = f"mutation {{ {operation}({mutation_input}) {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, mutation)
    assert actual_response == response


@pytest.mark.parametrize(
    "operation,query_input,field,response",
    [
        # Test case 8.1.32
        [
            "qrCode",
            'code: "1337beef"',
            "...on InsufficientPermissionError { name }",
            {"name": "qr:read"},
        ],
        # Test case 8.1.43
        [
            "standardProduct",
            "id: 1",
            "...on InsufficientPermissionError { name }",
            {"name": "standard_product:read"},
        ],
        # Test case 8.1.44
        [
            "standardProducts",
            "",
            "...on InsufficientPermissionError { name }",
            {"name": "standard_product:read"},
        ],
    ],
)
def test_query_insufficient_permission(
    unauthorized, read_only_client, operation, query_input, field, response
):
    if query_input:
        query_input = f"({query_input})"
    query = f"query {{ {operation}{query_input} {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, query)
    assert actual_response == response


@pytest.mark.parametrize(
    "operation,query_input,field,response",
    [
        # Test case 8.1.46
        [
            "standardProducts",
            "baseId: 3",
            "...on UnauthorizedForBaseError { id }",
            {"id": "3"},
        ],
    ],
)
def test_query_unauthorized_for_base(
    read_only_client, operation, query_input, field, response
):
    query = f"query {{ {operation}({query_input}) {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, query)
    assert actual_response == response
