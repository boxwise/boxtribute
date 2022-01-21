from auth import create_jwt_payload
from utils import assert_bad_user_input


def test_base_specific_permissions(client, mocker):
    """Verify that a user can only create beneficiary if base-specific permission
    available. QR codes can be created regardless of any base but for the front-end the
    base-specific distinction is relevant.
    """
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        email="dev_coordinator@boxcare.org",
        base_ids=[2, 3],
        organisation_id=2,
        roles=["base_2_coordinator", "base_3_coordinator"],
        user_id=1,
        permissions=[
            "base_2/qr:write",
            "stock:write",
            "base_3/beneficiary:write",
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
                    isRegistered: false
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
    assert_bad_user_input(read_only_client, query)
