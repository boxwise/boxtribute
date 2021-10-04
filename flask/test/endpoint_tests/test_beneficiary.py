def test_beneficiary(client):
    first_name = "Some"
    last_name = "One"
    dob = "2000-01-01"
    dos = "2021-09-09"
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
                    isSigned: true,
                    isRegistered: true,
                    signature: "{first_name}",
                    dateOfSignature: "{dos}"
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
    assert created_beneficiary["isSigned"]
    assert created_beneficiary["isRegistered"]
    assert created_beneficiary["signature"] == first_name
    assert created_beneficiary["dateOfSignature"] == dos
    assert created_beneficiary["createdOn"] == created_beneficiary["lastModifiedOn"]
    assert created_beneficiary["createdBy"] == created_beneficiary["lastModifiedBy"]
