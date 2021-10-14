import os

import pytest
from auth import create_jwt_payload


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_box_details(mysql_app_client):
    data = {
        "query": """query BoxIdAndItems {
                qrCode(qrCode: "ffdd7f7243d74a663b417562df0ebeb") {
                    box {
                        id
                        boxLabelIdentifier
                        location {
                            id
                            base {
                                id
                            }
                            name
                        }
                        items
                        size
                        state
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_box = response.json["data"]["qrCode"]["box"]
    assert response.status_code == 200
    assert queried_box == {
        "id": "642",
        "boxLabelIdentifier": "436898",
        "items": 87,
        "location": {
            "id": "18",
            "base": {"id": "2"},
            "name": "WH2",
        },
        "size": "52 Mixed",
        "state": "InStock",
    }

    data = {
        "query": """query SomeBoxDetails {
                box(boxId: "996559") {
                    qrCode {
                        id
                        code
                        createdOn
                    }
                    product {
                        id
                    }
                    size
                    items
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_box = response.json["data"]["box"]
    assert response.status_code == 200
    assert queried_box == {
        "qrCode": {
            "id": "574",
            "code": "224ac643d3b929f99c71c25ccde7dde",
            "createdOn": None,
        },
        "items": 84,
        "product": {
            "id": "156",
        },
        "size": "53 S",
    }


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_boxes(mysql_app_client):
    data = {
        "query": """query CommentsOfLostBoxes {
                location(id: "1") {
                    boxes {
                        comment
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["location"]["boxes"]
    assert response.status_code == 200
    assert len(queried_boxes) == 27
    # There are no comments currently. Verify by creating a set
    assert {box["comment"] for box in queried_boxes} == {""}


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_bases(mysql_app_client):
    data = {
        "query": """query basesOfBoxAid {
                organisation(id: "1") {
                    bases {
                        name
                        organisation {
                            id
                        }
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_locations = response.json["data"]["organisation"]["bases"]
    assert response.status_code == 200
    assert len(queried_locations) == 1
    assert queried_locations[0]["name"] == "Lesvos"


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_products(mysql_app_client):
    data = {
        "query": """query getShoes {
                productCategory(id: "5") {
                    products {
                        id
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_products = response.json["data"]["productCategory"]["products"]
    assert response.status_code == 200
    assert len(queried_products) == 13


@pytest.mark.skipif("CIRCLECI" not in os.environ, reason="only functional in CircleCI")
def test_get_beneficiaries(mysql_app_client):
    data = {
        "query": """query getBeneficiariesOfLesvos {
                base(id: 1) {
                    beneficiaries {
                        id
                        tokens
                    }
                }
            }"""
    }
    response = mysql_app_client.post("/graphql", json=data)
    queried_beneficiaries = response.json["data"]["base"]["beneficiaries"]
    assert response.status_code == 200
    assert len(queried_beneficiaries) == 1006
    assert queried_beneficiaries[0]["tokens"] == 13


def test_user_permissions(client, mocker):
    """Verify that creating a beneficiary is not possible if user has
    insufficient permissions.
    """
    mocker.patch("jose.jwt.decode").return_value = create_jwt_payload(
        email="dev_volunteer@boxcare.org",
        base_ids=[2, 3],
        organisation_id=2,
        roles=["Warehouse Volunteer"],
        user_id=16,
        permissions=["qr:create", "stock:write"],
    )

    data = {
        "query": """mutation {
            createBeneficiary(
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
            }
            createBox(
                boxCreationInput : {
                    productId: 1,
                    items: 99,
                    locationId: 1,
                    comment: ""
                }) {
                id
            }
        }"""
    }
    response = client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["createBeneficiary"] is None
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "FORBIDDEN"


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
        user_id=17,
        permissions=[
            "base_2:qr:create",
            "base_3:beneficiaries:write",
        ],
    )

    create_beneficiary_for_base2_mutation = """createBeneficiary(
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
