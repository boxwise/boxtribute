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
            signed
            registered
            signature
            dateOfSignature
            tokens
            createdOn
            transactions {{
                id
                beneficiary {{ id }}
                product {{ id }}
                count
                description
                tokens
                createdBy {{ id }}
                createdOn
            }}
            tags {{
                id
                name
                color
            }}
        }}
    }}"""


def test_beneficiary_query(
    read_only_client,
    default_beneficiary,
    relative_beneficiary,
    default_transaction,
    relative_transaction,
    tags,
):
    # Test case 9.1.4
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
        "signed": False,
        "registered": True,
        "signature": None,
        "dateOfSignature": None,
        "tokens": default_transaction["tokens"] + relative_transaction["tokens"],
        "createdOn": default_beneficiary["created_on"].isoformat() + "+00:00",
        "transactions": [
            {
                "id": str(tr["id"]),
                "beneficiary": {"id": str(default_beneficiary["id"])},
                "product": {"id": str(tr["product"])},
                "count": tr["count"],
                "description": tr["description"],
                "tokens": tr["tokens"],
                "createdBy": {"id": str(tr["created_by"])},
                "createdOn": tr["created_on"].isoformat() + "+00:00",
            }
            for tr in [default_transaction, relative_transaction]
        ],
        "tags": [
            {
                "id": str(tags[i]["id"]),
                "name": tags[i]["name"],
                "color": tags[i]["color"],
            }
            for i in [0, 2]
        ],
    }

    beneficiary_id = relative_beneficiary["id"]
    query = f"""query {{ beneficiary(id: {beneficiary_id}) {{
                gender
                age
                dateOfBirth }} }}"""
    beneficiary = assert_successful_request(read_only_client, query)
    assert beneficiary == {"gender": None, "age": None, "dateOfBirth": None}


def test_beneficiary_mutations(client):
    # Test case 9.2.1
    first_name = "Some"
    last_name = "One"
    dob_year = 2000
    dob = f"{dob_year}-01-01"
    dos = "2022-07-16"
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
                    registered: false
                    dateOfSignature: "{dos}"
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
                signed
                registered
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
    assert not created_beneficiary["signed"]
    assert not created_beneficiary["registered"]
    assert created_beneficiary["signature"] is None
    assert created_beneficiary["dateOfSignature"] == dos
    assert created_beneficiary["createdOn"] == created_beneficiary["lastModifiedOn"]
    assert created_beneficiary["createdBy"] == created_beneficiary["lastModifiedBy"]

    # Test case 9.2.9
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
                    registered: true
                }} ) {{
                id
            }}
        }}"""
    updated_beneficiary = assert_successful_request(client, mutation)
    assert updated_beneficiary == {"id": beneficiary_id}

    first_name = "Foo"
    dob = "2001-01-01"
    group_id = "1235"
    gender = "Male"
    comment = "cool dude"
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    firstName: "{first_name}",
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
        "signed": True,
        "registered": True,
        "signature": signature,
        "dateOfSignature": f"{dos}T00:00:00",
        "tokens": 0,
        "createdOn": created_beneficiary["createdOn"],
        "transactions": [],
        "tags": [],
    }


@pytest.mark.parametrize(
    "input,size,has_next_page,has_previous_page",
    (
        # Test case 9.1.1, 9.1.2
        ["", 3, False, False],
        #                             ID=0
        ["""(paginationInput: {after: "MDAwMDAwMDA="})""", 3, False, False],
        ["""(paginationInput: {first: 1})""", 1, True, False],
        #                             ID=3; previous page exists but can't be determined
        ["""(paginationInput: {after: "MDAwMDAwMDM="})""", 0, False, False],
        #                             ID=2
        ["""(paginationInput: {after: "MDAwMDAwMDI=", first: 1})""", 1, False, True],
        # next page exists but can't be determined
        ["""(paginationInput: {before: "MDAwMDAwMDE="})""", 0, False, False],
        #                              ID=4
        ["""(paginationInput: {before: "MDAwMDAwMDQ=", last: 2})""", 2, False, True],
        ["""(paginationInput: {before: "MDAwMDAwMDQ=", last: 3})""", 3, False, False],
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
        [[{"createdFrom": '"2020-01-01"'}], 3],
        [[{"createdFrom": '"2021-01-01"'}], 2],
        [[{"createdUntil": '"2019-12-31"'}], 0],
        [[{"createdUntil": '"2021-01-01"'}], 1],
        [[{"active": "true"}], 2],
        [[{"active": "false"}], 1],
        [[{"isVolunteer": "true"}], 1],
        [[{"isVolunteer": "false"}], 2],
        [[{"registered": "true"}], 2],
        [[{"registered": "false"}], 1],
        [[{"pattern": '"Body"'}], 2],
        [[{"pattern": '"fun"'}], 1],
        [[{"pattern": '"Z"'}], 0],
        [[{"pattern": '"1234"'}], 2],
        [[{"pattern": '"123"'}], 0],
        [[{"createdFrom": '"2022-01-01"'}, {"active": "true"}], 1],
        [[{"active": "true"}, {"registered": "false"}], 0],
        [[{"active": "false"}, {"pattern": '"no"'}], 1],
        [[{"isVolunteer": "true"}, {"registered": "true"}], 0],
    ],
    ids=_format,
)
def test_beneficiaries_filtered_query(read_only_client, filters, number):
    # Test case 9.1.3
    filter_input = ", ".join(f"{k}: {v}" for f in filters for k, v in f.items())
    query = f"""query {{ beneficiaries(filterInput: {{ {filter_input} }}) {{
                elements {{
                    id
                    active
                    isVolunteer
                    registered
                }} }} }}"""
    beneficiaries = assert_successful_request(read_only_client, query)["elements"]
    assert len(beneficiaries) == number

    for f in filters:
        for name in ["active", "isVolunteer", "registered"]:
            if name in f:
                value = f[name] == "true"
                assert [b[name] for b in beneficiaries] == number * [value]
