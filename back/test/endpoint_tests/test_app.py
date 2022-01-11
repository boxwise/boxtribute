from auth import create_jwt_payload


def test_get_boxes(dropapp_dev_client):
    data = {
        "query": """query CommentsOfLostBoxes {
                location(id: "1") {
                    boxes(paginationInput: { first: 20 }) {
                        elements {
                            comment
                        }
                        pageInfo {
                            hasPreviousPage
                            hasNextPage
                        }
                        totalCount
                    }
                }
            }"""
    }
    response = dropapp_dev_client.post("/graphql", json=data)
    queried_boxes = response.json["data"]["location"]["boxes"]["elements"]
    assert response.status_code == 200
    assert len(queried_boxes) == 20
    # There are no comments currently. Verify by creating a set
    assert {box["comment"] for box in queried_boxes} == {""}
    page_info = response.json["data"]["location"]["boxes"]["pageInfo"]
    assert not page_info["hasPreviousPage"]
    assert page_info["hasNextPage"]
    assert response.json["data"]["location"]["boxes"]["totalCount"] == 27


def test_get_bases(dropapp_dev_client):
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
    response = dropapp_dev_client.post("/graphql", json=data)
    queried_locations = response.json["data"]["organisation"]["bases"]
    assert response.status_code == 200
    assert len(queried_locations) == 1
    assert queried_locations[0]["name"] == "Lesvos"


def test_get_products(dropapp_dev_client):
    data = {
        "query": """query getShoes {
                productCategory(id: "5") {
                    products {
                        elements {
                            id
                        }
                        pageInfo {
                            hasPreviousPage
                            hasNextPage
                        }
                        totalCount
                    }
                }
            }"""
    }
    response = dropapp_dev_client.post("/graphql", json=data)
    queried_products = response.json["data"]["productCategory"]["products"]["elements"]
    assert response.status_code == 200
    assert len(queried_products) == 13
    page_info = response.json["data"]["productCategory"]["products"]["pageInfo"]
    assert not page_info["hasPreviousPage"]
    assert not page_info["hasNextPage"]
    assert response.json["data"]["productCategory"]["products"]["totalCount"] == 13


def test_get_beneficiaries(dropapp_dev_client):
    data = {
        "query": """query getBeneficiariesOfLesvos {
                base(id: 1) {
                    beneficiaries {
                        elements {
                            id
                            tokens
                        }
                        pageInfo {
                            hasPreviousPage
                            hasNextPage
                            startCursor
                            endCursor
                        }
                        totalCount
                    }
                }
            }"""
    }
    response = dropapp_dev_client.post("/graphql", json=data)
    base = response.json["data"]["base"]
    queried_beneficiaries = base["beneficiaries"]["elements"]
    assert response.status_code == 200
    assert len(queried_beneficiaries) == 50
    assert queried_beneficiaries[0]["tokens"] == 0

    page_info = base["beneficiaries"]["pageInfo"]
    cursor = page_info["endCursor"]
    assert not page_info["hasPreviousPage"]
    assert page_info["hasNextPage"]
    assert page_info["startCursor"] == "MDAwMDAwMDE="  # ID 1
    assert cursor == "MDAwMDAwNTA="  # corresponding to ID 50
    assert base["beneficiaries"]["totalCount"] == 1004

    data = {
        "query": f"""query getBeneficiariesOfLesvos {{
                base(id: 1) {{
                    beneficiaries(
                        paginationInput: {{ after: "{cursor}" }}
                    ) {{
                        elements {{
                            id
                        }}
                        pageInfo {{
                            hasPreviousPage
                            hasNextPage
                            startCursor
                            endCursor
                        }}
                    }}
                }}
                }}"""
    }
    response = dropapp_dev_client.post("/graphql", json=data)
    queried_beneficiaries = response.json["data"]["base"]["beneficiaries"]["elements"]
    assert response.status_code == 200
    assert len(queried_beneficiaries) == 50
    page_info = response.json["data"]["base"]["beneficiaries"]["pageInfo"]
    assert page_info["hasPreviousPage"]
    assert page_info["hasNextPage"]
    assert page_info["startCursor"] == "MDAwMDAwNTE="  # ID 51
    assert page_info["endCursor"] != cursor

    cursor = page_info["startCursor"]
    data = {
        "query": f"""query getBeneficiariesOfLesvos {{
                base(id: 1) {{
                    beneficiaries(
                        paginationInput: {{ before: "{cursor}" }}
                    ) {{
                        elements {{
                            id
                            tokens
                        }}
                        pageInfo {{
                            hasPreviousPage
                            hasNextPage
                            startCursor
                            endCursor
                        }}
                        totalCount
                    }}
                }}
                }}"""
    }
    response = dropapp_dev_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert response.json["data"]["base"] == base


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


def test_invalid_pagination_input(read_only_client):
    query = """query { beneficiaries(paginationInput: {last: 2}) {
        elements { id }
    } }"""
    data = {"query": query}
    response = read_only_client.post("/graphql", json=data)
    assert response.status_code == 200
    assert len(response.json["errors"]) == 1
    assert response.json["errors"][0]["extensions"]["code"] == "BAD_USER_INPUT"
    assert response.json["data"] is None
