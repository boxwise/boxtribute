import pytest
from utils import assert_successful_request


def test_beneficiary_mutations(client):
    first_name = "Some"
    last_name = "One"
    dob = "2000-01-01"
    base_id = 1
    group_id = "1234"
    gender = "Diverse"
    languages = ["en", "ar"]
    comment = "today is a good day"

    beneficiary_creation_input_string = f"""{{
                    firstName: "{first_name}",
                    lastName: "{last_name}",
                    dateOfBirth: "{dob}",
                    comment: "{comment}",
                    baseId: {base_id},
                    groupIdentifier: "{group_id}",
                    gender: {gender},
                    languages: [{','.join(languages)}],
                    isVolunteer: true,
                    isRegistered: false
                }}"""
    mutation = f"""mutation {{
            createBeneficiary(
                creationInput : {beneficiary_creation_input_string}
            ) {{
                id
                firstName
                lastName
                dateOfBirth
                comment
                base {{ id }}
                groupIdentifier
                gender
                languages
                familyHead {{ id }}
                isVolunteer
                isSigned
                isRegistered
                signature
                dateOfSignature
                createdOn
                createdBy {{ id }}
                lastModifiedOn
                lastModifiedBy {{ id }}
            }}
        }}"""

    created_beneficiary = assert_successful_request(client, mutation)
    beneficiary_id = created_beneficiary["id"]
    assert created_beneficiary["firstName"] == first_name
    assert created_beneficiary["lastName"] == last_name
    assert created_beneficiary["dateOfBirth"] == dob
    assert created_beneficiary["comment"] == comment
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
                updateInput : {{
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
                base {{ id }}
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
    updated_beneficiary = assert_successful_request(client, mutation)
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
            comment
            lastName
            lastModifiedOn
            tokens
        }}
    }}"""
    queried_beneficiary = assert_successful_request(client, query)
    assert queried_beneficiary["comment"] == comment
    assert queried_beneficiary["lastName"] == last_name
    assert queried_beneficiary["tokens"] == 0
    assert (
        queried_beneficiary["lastModifiedOn"] == updated_beneficiary["lastModifiedOn"]
    )


@pytest.mark.parametrize(
    "input,size,has_next_page,has_previous_page",
    (
        ["", 2, False, False],
        #                             ID=0
        ["""(paginationInput: {after: "MDAwMDAwMDA="})""", 2, False, False],
        ["""(paginationInput: {first: 1})""", 1, True, False],
        #                             ID=2; previous page exists but can't be determined
        ["""(paginationInput: {after: "MDAwMDAwMDI="})""", 0, False, False],
        #                             ID=1
        ["""(paginationInput: {after: "MDAwMDAwMDE=", first: 1})""", 1, False, True],
        # next page exists but can't be determined
        ["""(paginationInput: {before: "MDAwMDAwMDE="})""", 0, False, False],
        #                              ID=3
        ["""(paginationInput: {before: "MDAwMDAwMDM=", last: 1})""", 1, False, True],
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
def test_beneficiaries_paginated_query(
    read_only_client, input, size, has_next_page, has_previous_page
):
    query = f"""query {{ beneficiaries{input} {{
        elements {{ id }}
        pageInfo {{ hasNextPage hasPreviousPage }}
    }} }}"""
    pages = assert_successful_request(read_only_client, query)
    assert len(pages["elements"]) == size
    assert pages["pageInfo"]["hasNextPage"] == has_next_page
    assert pages["pageInfo"]["hasPreviousPage"] == has_previous_page
