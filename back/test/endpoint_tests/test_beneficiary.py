from datetime import date

import pytest
from boxtribute_server.enums import HumanGender
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.utils import (
    HISTORY_CREATION_MESSAGE,
    HISTORY_DELETION_MESSAGE,
    compute_age,
)
from utils import assert_successful_request


def _generate_beneficiary_query(id):
    return f"""query {{
        beneficiary(id: {id}) {{
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
        "age": compute_age(default_beneficiary["date_of_birth"]),
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


def test_beneficiary_mutations(
    client, default_beneficiary, another_relative_beneficiary, tags
):
    # Test case 9.2.1
    first_name = "Some"
    last_name = "One"
    dob_year = 2000
    dob = f"{dob_year}-01-01"
    dos = "2022-07-16"
    base_id = "1"
    group_id = "1234"
    gender = HumanGender.Diverse
    languages = ["en", "ar"]
    comment = "today is a good day"
    tag_id = str(tags[0]["id"])

    creation_input = f"""{{
                    firstName: "{first_name}",
                    lastName: "{last_name}",
                    dateOfBirth: "{dob}",
                    comment: "{comment}",
                    baseId: {base_id},
                    groupIdentifier: "{group_id}",
                    gender: {gender.name},
                    languages: [{','.join(languages)}],
                    isVolunteer: true,
                    registered: false
                    dateOfSignature: "{dos}"
                    tagIds: [{tag_id}]
                }}"""
    mutation = f"""mutation {{
            createBeneficiary(
                creationInput : {creation_input}
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
                tags {{ id }}
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
    assert created_beneficiary["base"]["id"] == base_id
    assert created_beneficiary["groupIdentifier"] == group_id
    assert created_beneficiary["gender"] == gender.name
    assert created_beneficiary["languages"] == languages
    assert created_beneficiary["familyHead"] is None
    assert created_beneficiary["isVolunteer"]
    assert not created_beneficiary["signed"]
    assert not created_beneficiary["registered"]
    assert created_beneficiary["signature"] is None
    assert created_beneficiary["dateOfSignature"] == dos
    assert created_beneficiary["tags"] == [{"id": tag_id}]
    assert created_beneficiary["createdOn"] == created_beneficiary["lastModifiedOn"]
    assert created_beneficiary["createdBy"] == created_beneficiary["lastModifiedBy"]

    # Test case 9.2.9
    new_last_name = "Body"
    new_dos = "2021-09-09"
    language = "nl"
    signature = first_name
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    lastName: "{new_last_name}",
                    signature: "{signature}",
                    dateOfSignature: "{new_dos}"
                    languages: [{language}],
                    isVolunteer: false,
                    registered: true
                }} ) {{
                id
            }}
        }}"""
    updated_beneficiary = assert_successful_request(client, mutation)
    assert updated_beneficiary == {"id": beneficiary_id}

    new_first_name = "Foo"
    new_dob = date(2001, 1, 1)
    new_formatted_dob = new_dob.strftime("%Y-%m-%d")
    new_group_id = "1235"
    new_gender = HumanGender.Male
    new_comment = "cool dude"
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    firstName: "{new_first_name}",
                    groupIdentifier: "{new_group_id}",
                    dateOfBirth: "{new_formatted_dob}",
                    comment: "{new_comment}",
                    gender: {new_gender.name},
                    familyHeadId: {beneficiary_id}
                }}) {{
                id
            }} }}"""
    updated_beneficiary = assert_successful_request(client, mutation)
    assert updated_beneficiary == {"id": beneficiary_id}

    query = _generate_beneficiary_query(beneficiary_id)
    queried_beneficiary = assert_successful_request(client, query)
    assert queried_beneficiary == {
        "firstName": new_first_name,
        "lastName": new_last_name,
        "dateOfBirth": new_formatted_dob,
        "age": compute_age(new_dob),
        "comment": new_comment,
        "base": {"id": base_id},
        "groupIdentifier": new_group_id,
        "gender": new_gender.name,
        "languages": [language],
        "familyHead": {"id": beneficiary_id},
        "isVolunteer": False,
        "signed": True,
        "registered": True,
        "signature": signature,
        "dateOfSignature": f"{new_dos}T00:00:00",
        "tokens": 0,
        "createdOn": created_beneficiary["createdOn"],
        "transactions": [],
        "tags": [{"id": tag_id, "color": tags[0]["color"], "name": tags[0]["name"]}],
    }

    # Test case 9.2.20
    today = date.today().isoformat()
    deactivated_beneficiary_id = default_beneficiary["id"]
    mutation = f"""mutation {{
            deactivateBeneficiary(id: {deactivated_beneficiary_id}) {{ active }} }}"""
    response = assert_successful_request(client, mutation)
    assert not response["active"]
    deactivated_child_id = another_relative_beneficiary["id"]
    query = f"query {{ beneficiary(id: {deactivated_child_id}) {{ active }} }}"
    response = assert_successful_request(client, query)
    assert not response["active"]

    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: {base_id}
                    beneficiaryData: [
                        {{
                            firstName: "{first_name}"
                            groupIdentifier: "{group_id}"
                        }},
                        {{
                            firstName: "{first_name}"
                            lastName: "{last_name}"
                            groupIdentifier: "{group_id}"
                            dateOfBirth: "{dob}"
                            gender: {gender.name}
                            isVolunteer: false
                            registered: false
                            tagIds: [1, 3]
                        }}
                    ] }} ) {{
                        ...on BeneficiariesResult {{
                            results {{
                                ...on Beneficiary {{
                                    id
                                    firstName
                                    lastName
                                    groupIdentifier
                                    dateOfBirth
                                    gender
                                    isVolunteer
                                    registered
                                    familyHead {{ id }}
                                    base {{ id }}
                                    tags {{ id }}
                                }}
                            }}
                        }}
                    }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {
        "results": [
            {
                "id": str(int(beneficiary_id) + 1),
                "firstName": first_name,
                "lastName": "",
                "groupIdentifier": group_id,
                "dateOfBirth": None,
                "gender": None,
                "isVolunteer": False,
                "registered": True,
                "familyHead": None,
                "base": {"id": base_id},
                "tags": [],
            },
            {
                "id": str(int(beneficiary_id) + 2),
                "firstName": first_name,
                "lastName": last_name,
                "groupIdentifier": group_id,
                "dateOfBirth": dob,
                "gender": gender.name,
                "isVolunteer": False,
                "registered": False,
                "familyHead": None,
                "base": {"id": base_id},
                "tags": [{"id": "1"}, {"id": "3"}],
            },
        ]
    }

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "people")
        .order_by(DbChangeHistory.id)
        .dicts()
    )
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": HISTORY_CREATION_MESSAGE,
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'lastname changed from "{last_name}" to "{new_last_name}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "notregistered",
            "record_id": int(beneficiary_id),
            "from_int": 1,
            "to_int": 0,
        },
        {
            "changes": "volunteer",
            "record_id": int(beneficiary_id),
            "from_int": 1,
            "to_int": 0,
        },
        {
            "changes": f'date_of_signature changed from "{dos} 00:00:00" '
            f'to "{new_dos}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "approvalsigned",
            "record_id": int(beneficiary_id),
            "from_int": 0,
            "to_int": 1,
        },
        {
            "changes": f'firstname changed from "{first_name}" to "{new_first_name}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'comments changed from "{comment}" to "{new_comment}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'container changed from "{group_id}" to "{new_group_id}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'date_of_birth changed from "{dob}" to "{new_formatted_dob}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'gender changed from "{gender.value}" to "{new_gender.value}";',
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": "parent_id",
            "record_id": int(beneficiary_id),
            "from_int": None,
            "to_int": int(beneficiary_id),
        },
        {
            "changes": HISTORY_DELETION_MESSAGE,
            "record_id": int(deactivated_child_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": HISTORY_DELETION_MESSAGE,
            "record_id": int(deactivated_beneficiary_id),
            "from_int": None,
            "to_int": None,
        },
    ]


@pytest.mark.parametrize(
    "input,size,has_next_page,has_previous_page",
    (
        # Test case 9.1.1, 9.1.2
        ["", 4, False, False],
        #                             ID=0
        ["""(paginationInput: {after: "MDAwMDAwMDA="})""", 4, False, False],
        ["""(paginationInput: {first: 1})""", 1, True, False],
        #                             ID=5; previous page exists but can't be determined
        ["""(paginationInput: {after: "MDAwMDAwMDU="})""", 0, False, False],
        #                             ID=3
        ["""(paginationInput: {after: "MDAwMDAwMDM=", first: 1})""", 1, False, True],
        # next page exists but can't be determined
        ["""(paginationInput: {before: "MDAwMDAwMDE="})""", 0, False, False],
        #                              ID=4
        ["""(paginationInput: {before: "MDAwMDAwMDQ=", last: 2})""", 2, True, True],
        ["""(paginationInput: {before: "MDAwMDAwMDQ=", last: 3})""", 3, True, False],
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
        [[{"createdFrom": '"2020-01-01"'}], 4],
        [[{"createdFrom": '"2021-01-01"'}], 3],
        [[{"createdUntil": '"2019-12-31"'}], 0],
        [[{"createdUntil": '"2021-01-01"'}], 1],
        [[{"active": "true"}], 3],
        [[{"active": "false"}], 1],
        [[{"isVolunteer": "true"}], 2],
        [[{"isVolunteer": "false"}], 2],
        [[{"registered": "true"}], 2],
        [[{"registered": "false"}], 2],
        [[{"pattern": '"Body"'}], 3],
        [[{"pattern": '"fun"'}], 1],
        [[{"pattern": '"Z"'}], 0],
        [[{"pattern": '"1234"'}], 3],
        [[{"pattern": '"123"'}], 0],
        [[{"createdFrom": '"2022-01-01"'}, {"active": "true"}], 1],
        [[{"active": "true"}, {"registered": "false"}], 1],
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
