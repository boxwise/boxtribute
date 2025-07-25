import peewee
import pytest
from auth import mock_user_for_request
from boxtribute_server.logging import API_CONTEXT, SHARED_CONTEXT, WEBAPP_CONTEXT
from utils import (
    assert_bad_user_input,
    assert_internal_server_error,
    assert_successful_request,
    assert_unauthorized,
)


def test_base_specific_permissions(client, mocker):
    """Verify that a user can only create beneficiary if base-specific permission
    available. QR codes can be created regardless of any base but for the front-end the
    base-specific distinction is relevant.
    """
    mock_user_for_request(
        mocker,
        organisation_id=2,
        user_id=1,
        permissions=[
            "base_2/qr:create",
            "stock:write",
            "base_3/beneficiary:create",
            "base_3/tag:read",
            "beneficiary_language:assign",
            "tag_relation:assign",
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
        # Test case 8.1.15
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


@pytest.mark.parametrize("resource", ["base", "organisation", "user"])
def test_query_non_existent_resource_for_god_user(read_only_client, mocker, resource):
    # Test case 99.1.3, 10.1.3
    # Non-god users would not be authorized to access resource ID 0
    mock_user_for_request(mocker, is_god=True)
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
        "markShipmentAsLost",
        "sendShipment",
        "startReceivingShipment",
        "deleteTag",
        "deactivateBeneficiary",
    ],
)
def test_mutation_non_existent_resource(read_only_client, operation):
    # Test cases 2.2.4, 2.2.6, 2.2.8, 3.2.8, 3.2.12, 3.2.14b, 4.2.10, 9.2.23
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
        ["updateShipmentWhenPreparing", "updateInput: { id: 0 }", "id"],
        ["updateShipmentWhenReceiving", "updateInput: { id: 0 }", "id"],
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


@pytest.mark.parametrize(
    "operation,mutation_input,field,response",
    [
        # Test case 8.2.36
        [
            "createCustomProduct",
            """creationInput:
            { baseId: 0, name: "a", categoryId: 1, sizeRangeId: 1, gender: none}""",
            "...on UnauthorizedForBaseError { id name organisationName }",
            {"id": "0", "name": "", "organisationName": ""},
        ],
        # Test case 8.2.37
        [
            "createCustomProduct",
            """creationInput:
            { baseId: 1, name: "a", categoryId: 1, sizeRangeId: 0, gender: none}""",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "SizeRange"},
        ],
        # Test case 8.2.38
        [
            "createCustomProduct",
            """creationInput:
            { baseId: 1, name: "a", categoryId: 0, sizeRangeId: 1, gender: none}""",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "ProductCategory"},
        ],
        # Test case 8.2.46
        [
            "editCustomProduct",
            "editInput: { id: 1, sizeRangeId: 0 }",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "SizeRange"},
        ],
        # Test case 8.2.47
        [
            "editCustomProduct",
            "editInput: { id: 1, categoryId: 0 }",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "ProductCategory"},
        ],
        # Test case 8.2.48
        [
            "editCustomProduct",
            "editInput: { id: 0 }",
            "...on ResourceDoesNotExistError { id name }",
            {"id": "0", "name": "Product"},
        ],
        # Test case 8.2.56
        [
            "deleteProduct",
            "id: 0",
            "...on ResourceDoesNotExistError { id name }",
            {"id": "0", "name": "Product"},
        ],
        # Test case 8.2.62
        [
            "enableStandardProduct",
            """enableInput: { baseId: 0, standardProductId: 2 }""",
            "...on UnauthorizedForBaseError { id name organisationName }",
            {"id": "0", "name": "", "organisationName": ""},
        ],
        # Test case 8.2.63
        [
            "enableStandardProduct",
            """enableInput: { baseId: 1, standardProductId: 2, sizeRangeId: 0 }""",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "SizeRange"},
        ],
        # Test case 8.2.64
        [
            "enableStandardProduct",
            """enableInput: { baseId: 1, standardProductId: 0 }""",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "StandardProduct"},
        ],
        # Test case 8.2.88
        [
            "enableStandardProducts",
            """enableInput: { baseId: 0, standardProductIds: [2] }""",
            "...on UnauthorizedForBaseError { id name organisationName }",
            {"id": "0", "name": "", "organisationName": ""},
        ],
        # Test case 8.2.71
        [
            "editStandardProductInstantiation",
            "editInput: { id: 5, sizeRangeId: 0 }",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "SizeRange"},
        ],
        # Test case 8.2.72
        [
            "editStandardProductInstantiation",
            "editInput: { id: 0 }",
            "...on ResourceDoesNotExistError { id name }",
            {"id": "0", "name": "Product"},
        ],
        # Test case 8.2.81
        [
            "disableStandardProduct",
            "instantiationId: 0",
            "...on ResourceDoesNotExistError { id name }",
            {"id": "0", "name": "Product"},
        ],
        # Test case 8.2.22g
        [
            "moveBoxesToLocation",
            'updateInput: { labelIdentifiers: ["12345678"], locationId: 0 }',
            "...on ResourceDoesNotExistError { id name }",
            {"id": "0", "name": "Location"},
        ],
        # Test case 8.2.23g
        [
            "assignTagsToBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [0] }',
            "tagErrorInfo { id error { ...on ResourceDoesNotExistError { id name } } }",
            {"tagErrorInfo": [{"error": {"id": "0", "name": "Tag"}, "id": "0"}]},
        ],
        # Test case 8.2.24g
        [
            "unassignTagsFromBoxes",
            'updateInput: { labelIdentifiers: ["12345678"], tagIds: [0] }',
            "tagErrorInfo { id error { ...on ResourceDoesNotExistError { id name } } }",
            {"tagErrorInfo": [{"error": {"id": "0", "name": "Tag"}, "id": "0"}]},
        ],
        # Test case 12.2.6
        [
            "createShareableLink",
            'creationInput: { baseId: 0, view: StatvizDashboard, validUntil: "2100-01-01"}',  # noqa
            "...on UnauthorizedForBaseError { id name organisationName }",
            {"id": "0", "name": "", "organisationName": ""},
        ],
        [
            "createBeneficiaries",
            "creationInput: { baseId: 0, beneficiaryData: [] }",
            "...on UnauthorizedForBaseError { id name organisationName }",
            {"id": "0", "name": "", "organisationName": ""},
        ],
    ],
)
def test_mutate_resource_does_not_exist(
    read_only_client, operation, mutation_input, field, response
):
    mutation = f"mutation {{ {operation}({mutation_input}) {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, mutation)
    assert actual_response == response


@pytest.mark.parametrize(
    "operation,query_input,field,response",
    [
        # Test case 8.1.31
        [
            "qrCode",
            'code: "0"',
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "QrCode"},
        ],
        # Test case 8.1.42
        [
            "standardProduct",
            "id: 0",
            "...on ResourceDoesNotExistError { id name }",
            {"id": None, "name": "StandardProduct"},
        ],
    ],
)
def test_query_resource_does_not_exist(
    read_only_client, operation, query_input, field, response
):
    query = f"query {{ {operation}({query_input}) {{ {field} }} }}"
    actual_response = assert_successful_request(read_only_client, query)
    assert actual_response == response


def test_mutation_arbitrary_database_error(read_only_client, mocker):
    mocker.patch(
        "boxtribute_server.business_logic.warehouse.qr_code.mutations.create_qr_code"
    ).side_effect = peewee.PeeweeException
    mutation = "mutation { createQrCode { id } }"
    assert_internal_server_error(read_only_client, mutation, field="createQrCode")


@pytest.mark.parametrize(
    "origin",
    [
        "https://illegal-origin.org",
        "http://localhost:3000",
        "https://v2-staging.boxtribute.org",
        "https://v2-demo.boxtribute.org",
        "https://v2.boxtribute.org",
        "https://v2-staging-dot-dropapp-242214.ew.r.appspot.com",
        "https://v2-demo-dot-dropapp-242214.ew.r.appspot.com",
        "https://v2-production-dot-dropapp-242214.ew.r.appspot.com",
    ],
)
def test_cors_preflight_request(read_only_client, origin):
    # Simulate CORS preflight request
    request_methods = "POST"
    request_headers = "Authorization"
    response = read_only_client.options(
        "/graphql",
        headers=[
            ("origin", origin),
            ("Access-Control-Request-Method", request_methods),
            ("Access-Control-Request-Headers", request_headers),
        ],
    )
    assert response.status_code == 200
    if "illegal" in origin:
        assert response.headers.get("Access-Control-Allow-Origin") is None
        assert response.headers.get("Access-Control-Allow-Headers") is None
        assert response.headers.get("Access-Control-Allow-Methods") is None
    else:
        assert response.headers.get("Access-Control-Allow-Origin") == origin
        assert response.headers.get("Access-Control-Allow-Headers") == request_headers
        assert response.headers.get("Access-Control-Allow-Methods") == request_methods


def test_introspect_schema(read_only_client, monkeypatch):
    query = """\
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
  }
}
"""
    assert_successful_request(read_only_client, query)

    monkeypatch.setenv("ENVIRONMENT", "production")
    assert_unauthorized(read_only_client, query)


def test_gcloud_logging(read_only_client, mocker):
    mocked_loggers = mocker.patch("boxtribute_server.logging.request_loggers")
    # If __getitem__() is not explicitly mocked, then the calls to obtain dict values
    # via request_loggers[WEBAPP_CONTEXT] and request_loggers[API_CONTEXT] will return
    # the same mock which results in confusing behaviour
    logger_for_context = {
        c: mocker.MagicMock() for c in [WEBAPP_CONTEXT, API_CONTEXT, SHARED_CONTEXT]
    }
    mocked_loggers.__getitem__.side_effect = logger_for_context.__getitem__
    query = "query { bases { id } }"

    # Send request to /graphql endpoint of webapp blueprint
    bases = assert_successful_request(read_only_client, query)

    # Expect one call to webapp logger including execution time
    mocked_log_struct = mocked_loggers[WEBAPP_CONTEXT].log_struct
    mocked_log_struct.assert_called_once()
    assert mocked_log_struct.call_args.kwargs == {"severity": "INFO"}
    call_args = mocked_log_struct.call_args.args[0]
    assert call_args.pop("execution_time") < 10
    assert call_args == {"query": query}
    assert bases == [{"id": "1"}]
    mocked_loggers[API_CONTEXT].log_struct.assert_not_called()
    mocked_loggers[SHARED_CONTEXT].log_struct.assert_not_called()

    mocked_loggers[WEBAPP_CONTEXT].reset_mock()
    # Send request to / endpoint of query-API blueprint
    bases = assert_successful_request(read_only_client, query, endpoint="")

    # Expect one call to api logger including execution time
    mocked_log_struct = mocked_loggers[API_CONTEXT].log_struct
    mocked_log_struct.assert_called_once()
    assert mocked_log_struct.call_args.kwargs == {"severity": "INFO"}
    call_args = mocked_log_struct.call_args.args[0]
    assert call_args.pop("execution_time") < 10
    assert call_args == {"query": query}
    assert bases == [{"id": "1"}]
    mocked_loggers[WEBAPP_CONTEXT].log_struct.assert_not_called()
    mocked_loggers[SHARED_CONTEXT].log_struct.assert_not_called()

    mocked_loggers[API_CONTEXT].reset_mock()
    # Send request to /public endpoint of shared blueprint
    query = 'query { resolveLink(code: "abc") { __typename } }'
    response = assert_successful_request(read_only_client, query, endpoint="public")

    # Expect one call to shared logger without execution time
    mocked_log_struct = mocked_loggers[SHARED_CONTEXT].log_struct
    mocked_log_struct.assert_called_once()
    assert mocked_log_struct.call_args.kwargs == {"severity": "INFO"}
    assert mocked_log_struct.call_args.args == ({"query": query},)
    assert response == {"__typename": "UnknownLinkError"}
    mocked_loggers[WEBAPP_CONTEXT].log_struct.assert_not_called()
    mocked_loggers[API_CONTEXT].log_struct.assert_not_called()


def test_replica_usage(read_only_client, mocker):
    from boxtribute_server.db import db

    db.replica = mocker.MagicMock()
    query = 'query { resolveLink(code: "abc") { __typename } }'
    assert_successful_request(read_only_client, query, endpoint="public")
    db.replica.connect.assert_called_once()  # in DatabaseManager.connect_db()
    db.replica.bind_ctx.assert_called_once()  # in use_db_replica()
