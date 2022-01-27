from datetime import date

import pytest
from boxtribute_server.enums import HumanGender
from utils import assert_successful_request


def _generate_beneficiary_query(id):
    return f"""query {{
        beneficiary(id: {id}) {{
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
            tokens
            createdOn
        }}
    }}"""


def test_beneficiary_query(read_only_client, default_beneficiary, default_transaction):
    query = _generate_beneficiary_query(default_beneficiary["id"])
    beneficiary = assert_successful_request(read_only_client, query)
    assert beneficiary == {
        "firstName": default_beneficiary["first_name"],
        "lastName": default_beneficiary["last_name"],
        "dateOfBirth": default_beneficiary["date_of_birth"].isoformat(),
        "comment": default_beneficiary["comment"],
        "base": {"id": str(default_beneficiary["base"])},
        "groupIdentifier": default_beneficiary["group_identifier"],
        "gender": HumanGender(default_beneficiary["gender"]).name,
        "languages": [],
        "familyHead": None,
        "isVolunteer": False,
        "isSigned": False,
        "isRegistered": True,
        "signature": None,
        "dateOfSignature": None,
        "tokens": default_transaction["tokens"],
        "createdOn": default_beneficiary["created_on"].isoformat() + "+00:00",
    }


def test_beneficiary_mutations(client):
    first_name = "Some"
    last_name = "One"
    dob_year = 2000
    dob = f"{dob_year}-01-01"
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
                age
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
    assert created_beneficiary["age"] == date.today().year - dob_year
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
    signature = first_name
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    lastName: "{last_name}",
                    signature: "{signature}",
                    dateOfSignature: "{dos}"
                    languages: [{language}],
                    isVolunteer: false,
                    isRegistered: true
                }} ) {{
                id
            }}
        }}"""
    updated_beneficiary = assert_successful_request(client, mutation)
    assert updated_beneficiary == {"id": beneficiary_id}

    first_name = "Foo"
    dob = "2001-01-01"
    base_id = 1
    group_id = "1235"
    gender = "Male"
    comment = "cool dude"
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    firstName: "{first_name}",
                    baseId: {base_id},
                    groupIdentifier: "{group_id}",
                    dateOfBirth: "{dob}",
                    comment: "{comment}",
                    gender: {gender},
                    familyHeadId: {beneficiary_id}
                }}) {{
                id
            }} }}"""
    updated_beneficiary = assert_successful_request(client, mutation)
    assert updated_beneficiary == {"id": beneficiary_id}

    query = _generate_beneficiary_query(beneficiary_id)
    queried_beneficiary = assert_successful_request(client, query)
    assert queried_beneficiary == {
        "firstName": first_name,
        "lastName": last_name,
        "dateOfBirth": dob,
        "comment": comment,
        "base": {"id": str(base_id)},
        "groupIdentifier": group_id,
        "gender": gender,
        "languages": [language],
        "familyHead": {"id": beneficiary_id},
        "isVolunteer": False,
        "isSigned": True,
        "isRegistered": True,
        "signature": signature,
        "dateOfSignature": f"{dos}T00:00:00",
        "tokens": 0,
        "createdOn": created_beneficiary["createdOn"],
    }


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
        ["""(paginationInput: {before: "MDAwMDAwMDM=", last: 2})""", 2, False, False],
    ),
    ids=[
        "no input",
        "after",
        "first",
        "after-final",
        "after-first",
        "before",
        "before-last",
        "before-last2",
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


def _format(parameter):
    try:
        return ",".join(f"{k}={v}" for f in parameter for k, v in f.items())
    except TypeError:
        return parameter  # integer number


@pytest.mark.parametrize(
    "filters,number",
    [
        [[{"createdFrom": '"2020-01-01"'}], 2],
        [[{"createdFrom": '"2021-01-01"'}], 1],
        [[{"createdUntil": '"2019-12-31"'}], 0],
        [[{"createdUntil": '"2021-01-01"'}], 1],
        [[{"active": "true"}], 1],
        [[{"active": "false"}], 1],
        [[{"isVolunteer": "true"}], 1],
        [[{"isVolunteer": "false"}], 1],
        [[{"isRegistered": "true"}], 1],
        [[{"isRegistered": "false"}], 1],
        [[{"pattern": '"Body"'}], 2],
        [[{"pattern": '"fun"'}], 1],
        [[{"pattern": '"Z"'}], 0],
        [[{"pattern": '"1234"'}], 2],
        [[{"pattern": '"123"'}], 0],
        [[{"createdFrom": '"2020-01-01"'}, {"active": "true"}], 1],
        [[{"active": "true"}, {"isRegistered": "false"}], 0],
        [[{"active": "false"}, {"pattern": '"no"'}], 1],
        [[{"isVolunteer": "true"}, {"isRegistered": "true"}], 0],
    ],
    ids=_format,
)
def test_beneficiaries_filtered_query(read_only_client, filters, number):
    filter_input = ", ".join(f"{k}: {v}" for f in filters for k, v in f.items())
    query = f"""query {{ beneficiaries(filterInput: {{ {filter_input} }}) {{
                elements {{
                    id
                    active
                    isVolunteer
                    isRegistered
                }} }} }}"""
    beneficiaries = assert_successful_request(read_only_client, query)["elements"]
    assert len(beneficiaries) == number

    for f in filters:
        for name in ["active", "isVolunteer", "isRegistered"]:
            if name in f:
                value = f[name] == "true"
                assert [b[name] for b in beneficiaries] == number * [value]
