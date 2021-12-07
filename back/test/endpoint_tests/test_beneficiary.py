import pytest


def test_beneficiary(client):
    first_name = "Some"
    last_name = "One"
    dob = "2000-01-01"
    base_id = 1
    group_id = "1234"
    gender = "Diverse"
    languages = ["en", "ar"]

    beneficiary_creation_input_string = f"""{{
                    firstName: "{first_name}",
                    lastName: "{last_name}",
                    dateOfBirth: "{dob}",
                    baseId: {base_id},
                    groupIdentifier: "{group_id}",
                    gender: {gender},
                    languages: [{','.join(languages)}],
                    isVolunteer: true,
                    isRegistered: false
                }}"""

    gql_mutation_string = f"""mutation {{
            createBeneficiary(
                beneficiaryCreationInput : {beneficiary_creation_input_string}
            ) {{
                id
                firstName
                lastName
                dateOfBirth
                base {{
                    id
                }}
                groupIdentifier
                gender
                languages
                familyHead {{
                    id
                }}
                isVolunteer
                isSigned
                isRegistered
                signature
                dateOfSignature
                createdOn
                createdBy {{
                    id
                }}
                lastModifiedOn
                lastModifiedBy {{
                    id
                }}
            }}
        }}"""

    data = {"query": gql_mutation_string}
    response = client.post("/graphql", json=data)
    created_beneficiary = response.json["data"]["createBeneficiary"]
    beneficiary_id = created_beneficiary["id"]

    assert response.status_code == 200
    assert created_beneficiary["firstName"] == first_name
    assert created_beneficiary["lastName"] == last_name
    assert created_beneficiary["dateOfBirth"] == dob
    assert int(created_beneficiary["base"]["id"]) == base_id
    assert created_beneficiary["groupIdentifier"] == group_id
    assert created_beneficiary["gender"] == gender
    assert created_beneficiary["languages"] == languages
    assert created_beneficiary["familyHead"] is None
    assert created_beneficiary["isVolunteer"]
    assert not created_beneficiary["isSigned"]
    assert not created_beneficiary["isRegistered"]
    assert created_beneficiary["signature"] is None
    assert created_beneficiary["dateOfSignature"] is None
    assert created_beneficiary["createdOn"] == created_beneficiary["lastModifiedOn"]
    assert created_beneficiary["createdBy"] == created_beneficiary["lastModifiedBy"]

    last_name = "Body"
    dos = "2021-09-09"
    language = "nl"
    mutation = f"""mutation {{
            updateBeneficiary(
                beneficiaryUpdateInput : {{
                    id: {beneficiary_id},
                    lastName: "{last_name}",
                    signature: "{first_name}",
                    dateOfSignature: "{dos}"
                    languages: [{language}],
                    isVolunteer: false,
                    isRegistered: true
                }} ) {{
                id
                lastName
                base {{
                    id
                }}
                languages
                isVolunteer
                isSigned
                isRegistered
                signature
                dateOfSignature
                createdOn
                lastModifiedOn
            }}
        }}"""
    data = {"query": mutation}
    response = client.post("/graphql", json=data)
    updated_beneficiary = response.json["data"]["updateBeneficiary"]

    assert response.status_code == 200
    assert updated_beneficiary["id"] == beneficiary_id
    assert updated_beneficiary["lastName"] == last_name
    assert int(updated_beneficiary["base"]["id"]) == base_id
    assert updated_beneficiary["languages"] == [language]
    assert not updated_beneficiary["isVolunteer"]
    assert updated_beneficiary["isSigned"]
    assert updated_beneficiary["isRegistered"]
    assert updated_beneficiary["signature"] == first_name
    assert updated_beneficiary["dateOfSignature"] == dos
    assert updated_beneficiary["createdOn"] == created_beneficiary["createdOn"]

    query = f"""query {{
        beneficiary(id: {beneficiary_id}) {{
            lastName
            lastModifiedOn
            tokens
        }}
    }}"""
    data = {"query": query}
    response = client.post("/graphql", json=data)
    queried_beneficiary = response.json["data"]["beneficiary"]

    assert response.status_code == 200
    assert queried_beneficiary["lastName"] == last_name
    assert queried_beneficiary["tokens"] == 0
    assert (
        queried_beneficiary["lastModifiedOn"] == updated_beneficiary["lastModifiedOn"]
    )


@pytest.mark.parametrize(
    "input,size,has_next_page,has_previous_page",
    (
        ["", 2, False, False],
        #                             ID=2
        ["""(paginationInput: {after: "MDAwMDAwMDI="})""", 2, False, False],
        ["""(paginationInput: {first: 1})""", 1, True, False],
        #                             ID=4; previous page exists but can't be determined
        ["""(paginationInput: {after: "MDAwMDAwMDQ="})""", 0, False, False],
        #                             ID=3
        ["""(paginationInput: {after: "MDAwMDAwMDM=", first: 1})""", 1, False, True],
        # next page exists but can't be determined
        ["""(paginationInput: {before: "MDAwMDAwMDM="})""", 0, False, False],
        #                              ID=5
        ["""(paginationInput: {before: "MDAwMDAwMDU=", last: 1})""", 1, False, True],
    ),
    ids=[
        "no input",
        "after",
        "first",
        "after-final",
        "after-first",
        "before",
        "before-last",
    ],
)
def test_query_beneficiaries(client, input, size, has_next_page, has_previous_page):
    query = f"""query {{ beneficiaries{input} {{
        elements {{ id }}
        pageInfo {{ hasNextPage hasPreviousPage }}
    }} }}"""
    data = {"query": query}
    response = client.post("/graphql", json=data)
    queried_beneficiaries = response.json["data"]["beneficiaries"]["elements"]
    assert response.status_code == 200
    assert len(queried_beneficiaries) == size
    assert (
        response.json["data"]["beneficiaries"]["pageInfo"]["hasNextPage"]
        == has_next_page
    )
    assert (
        response.json["data"]["beneficiaries"]["pageInfo"]["hasPreviousPage"]
        == has_previous_page
    )
