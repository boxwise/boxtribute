from datetime import date, timedelta
from unittest import mock

import pytest
from auth import mock_user_for_request
from boxtribute_server.enums import HumanGender, Language
from boxtribute_server.models.definitions.beneficiary import Beneficiary
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.utils import (
    HISTORY_CREATION_MESSAGE,
    HISTORY_DELETION_MESSAGE,
    compute_age_in_days,
)
from utils import assert_internal_server_error, assert_successful_request


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
            familyMembers {{ id }}
            isVolunteer
            signed
            registered
            signature
            dateOfSignature
            email
            phoneNumber
            customTextField1
            customTextField2
            customNumberField
            customDateField
            tokens
            createdOn
            deactivatedOn
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
    client,
    default_beneficiary,
    relative_beneficiary,
    another_relative_beneficiary,
    default_transaction,
    relative_transaction,
    tags,
):
    # Test case 9.1.4
    query = _generate_beneficiary_query(default_beneficiary["id"])
    beneficiary = assert_successful_request(client, query)
    assert beneficiary == {
        "firstName": default_beneficiary["first_name"],
        "lastName": default_beneficiary["last_name"],
        "dateOfBirth": default_beneficiary["date_of_birth"].isoformat(),
        "age": compute_age_in_days(default_beneficiary["date_of_birth"]),
        "comment": default_beneficiary["comment"],
        "base": {"id": str(default_beneficiary["base"])},
        "groupIdentifier": default_beneficiary["group_identifier"],
        "gender": HumanGender(default_beneficiary["gender"]).name,
        "languages": [Language.en.name, Language.ar.name],
        "familyHead": None,
        "familyMembers": [
            {"id": str(relative_beneficiary["id"])},
            {"id": str(another_relative_beneficiary["id"])},
        ],
        "isVolunteer": False,
        "signed": False,
        "registered": True,
        "signature": None,
        "dateOfSignature": None,
        "email": default_beneficiary["email"],
        "phoneNumber": default_beneficiary["phone_number"],
        "customTextField1": default_beneficiary["custom_text_field_1"],
        "customTextField2": default_beneficiary["custom_text_field_2"],
        "customDateField": None,
        "customNumberField": default_beneficiary["custom_number_field"],
        "deactivatedOn": None,
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
                id
                familyHead {{ id }}
                familyMembers {{ id }}
                languages
                gender
                age
                dateOfBirth }} }}"""
    beneficiary = assert_successful_request(client, query)
    assert beneficiary == {
        "id": str(beneficiary_id),
        "familyHead": {"id": str(default_beneficiary["id"])},
        "familyMembers": [
            {"id": str(default_beneficiary["id"])},
            {"id": str(another_relative_beneficiary["id"])},
        ],
        "languages": [],
        "gender": HumanGender.Diverse.name,
        "age": None,
        "dateOfBirth": None,
    }


def test_beneficiary_mutations(
    client,
    mocker,
    default_beneficiary,
    another_relative_beneficiary,
    tags,
    deleted_base,
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
    assert created_beneficiary["age"] == (date.today() - date(dob_year, 1, 1)).days
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
        "age": compute_age_in_days(new_dob),
        "comment": new_comment,
        "base": {"id": base_id},
        "groupIdentifier": new_group_id,
        "gender": new_gender.name,
        "languages": [language],
        "familyHead": None,
        "familyMembers": [],
        "isVolunteer": False,
        "signed": True,
        "registered": True,
        "signature": signature,
        "dateOfSignature": f"{new_dos}T00:00:00",
        "email": "",
        "phoneNumber": None,
        "customTextField1": None,
        "customTextField2": None,
        "customNumberField": None,
        "customDateField": None,
        "deactivatedOn": None,
        "tokens": 0,
        "createdOn": created_beneficiary["createdOn"],
        "transactions": [],
        "tags": [{"id": tag_id, "color": tags[0]["color"], "name": tags[0]["name"]}],
    }

    # Test case 9.2.20
    today = date.today().isoformat()
    deactivated_beneficiary_id = default_beneficiary["id"]
    mutation = f"""mutation {{
            deactivateBeneficiary(id: {deactivated_beneficiary_id})
                {{ deactivatedOn }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["deactivatedOn"] is not None
    deactivated_child_id = another_relative_beneficiary["id"]
    query = f"query {{ beneficiary(id: {deactivated_child_id}) {{ deactivatedOn }} }}"
    response = assert_successful_request(client, query)
    assert response["deactivatedOn"] is not None

    phone_number = "+491234567"
    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: {base_id}
                    beneficiaryData: [
                        {{
                            firstName: "{first_name}"
                            lastName: "{last_name}"
                            groupIdentifier: "{group_id}"
                            dateOfBirth: "{dob}"
                            gender: {gender.name}
                            isVolunteer: false
                            registered: false
                            comment: "{new_comment}"
                            tagIds: [1, 3]
                            phoneNumber: "{phone_number}"
                        }},
                        {{
                            firstName: "{first_name}"
                            groupIdentifier: "{group_id}"
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
                                    comment
                                    isVolunteer
                                    registered
                                    phoneNumber
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
                "lastName": last_name,
                "groupIdentifier": group_id,
                "dateOfBirth": dob,
                "gender": gender.name,
                "comment": new_comment,
                "isVolunteer": False,
                "registered": False,
                "familyHead": None,
                "base": {"id": base_id},
                "tags": [{"id": "1"}, {"id": "3"}],
                "phoneNumber": phone_number,
            },
            {
                "id": str(int(beneficiary_id) + 2),
                "firstName": first_name,
                "lastName": "",
                "groupIdentifier": group_id,
                "dateOfBirth": None,
                "gender": HumanGender.Diverse.name,
                "comment": "",
                "isVolunteer": False,
                "registered": True,
                "familyHead": None,
                "base": {"id": base_id},
                "tags": [],
                "phoneNumber": None,
            },
        ]
    }

    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: {base_id}
                    beneficiaryData: []
                }}) {{
                    ...on BeneficiariesResult {{ results {{ __typename }} }}
                    }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"results": []}

    deleted_base_id = deleted_base["id"]
    mock_user_for_request(mocker, organisation_id=3, base_ids=[deleted_base_id])
    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: {deleted_base_id}
                    beneficiaryData: [
                        {{
                            firstName: "{first_name}"
                            groupIdentifier: "{group_id}"
                        }}
                    ] }} ) {{
                        ...on DeletedBaseError {{ name }}
                    }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"name": deleted_base["name"]}

    # Testing with god user to make all authz checks in the resolver pass albeit
    # non-existing base
    mock_user_for_request(mocker, is_god=True)
    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: 0
                    beneficiaryData: [
                        {{
                            firstName: "{first_name}"
                            groupIdentifier: "{group_id}"
                        }}
                    ] }} ) {{
                        ...on ResourceDoesNotExistError {{ id name }}
                    }} }}"""
    response = assert_successful_request(client, mutation)
    assert response == {"name": "Base", "id": "0"}

    # Mock the Beneficiary.select method in the create_beneficiaries function
    BeneficiaryMock = mocker.patch(
        "boxtribute_server.business_logic.beneficiary.crud.Beneficiary"
    )
    SelectMock = mock.MagicMock()
    SelectMock.where.return_value = [
        Beneficiary(
            first_name=first_name,
            last_name="",
            comment="",
            gender=HumanGender.Diverse,
            # These values are simulated to be off for some reason
            group_identifier="X",
            base=0,
        )
    ]
    BeneficiaryMock.select.return_value = SelectMock
    BeneficiaryMock.id.__ge__ = lambda *_: None
    BeneficiaryMock.id.__lt__ = lambda *_: None
    BeneficiaryMock.id.__add__ = lambda *_: 0
    mutation = f"""mutation {{ createBeneficiaries(creationInput: {{
                    baseId: 1
                    beneficiaryData: [
                        {{
                            firstName: "{first_name}"
                            groupIdentifier: "{group_id}"
                        }}
                    ] }} ) {{
                       ...on BeneficiariesResult {{ results {{ __typename }} }}
                    }} }}"""
    response = assert_internal_server_error(client, mutation)
    assert response.json["data"] == {"createBeneficiaries": None}
    assert response.json["errors"][0]["extensions"]["invalid_fields"] == {
        "0": [{"group_identifier": [group_id, "X"]}, {"base": [1, 0]}]
    }

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "people", DbChangeHistory.id > 111)
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
        {
            "changes": HISTORY_CREATION_MESSAGE,
            "record_id": int(beneficiary_id) + 1,
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": HISTORY_CREATION_MESSAGE,
            "record_id": int(beneficiary_id) + 2,
            "from_int": None,
            "to_int": None,
        },
    ]


@pytest.mark.parametrize(
    "input,size,has_next_page,has_previous_page",
    (
        # Test case 9.1.1, 9.1.2
        ["", 5, False, False],
        #                             ID=0
        ["""(paginationInput: {after: "MDAwMDAwMDA="})""", 5, False, False],
        ["""(paginationInput: {first: 1})""", 1, True, False],
        #                             ID=6; previous page exists but can't be determined
        ["""(paginationInput: {after: "MDAwMDAwMDY="})""", 0, False, False],
        #                             ID=5
        ["""(paginationInput: {after: "MDAwMDAwMDU=", first: 1})""", 1, False, True],
        # next page exists but can't be determined
        ["""(paginationInput: {before: "MDAwMDAwMDE="})""", 0, False, False],
        #                              ID=5
        ["""(paginationInput: {before: "MDAwMDAwMDU=", last: 2})""", 2, True, True],
        ["""(paginationInput: {before: "MDAwMDAwMDU=", last: 3})""", 3, True, False],
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
    client, input, size, has_next_page, has_previous_page
):
    query = f"""query {{ beneficiaries{input} {{
        elements {{ id }}
        pageInfo {{ hasNextPage hasPreviousPage }}
    }} }}"""
    pages = assert_successful_request(client, query)
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
        [[{"createdFrom": '"2020-01-01"'}], 5],
        [[{"createdFrom": '"2021-01-01"'}], 4],
        [[{"createdUntil": '"2019-12-31"'}], 0],
        [[{"createdUntil": '"2021-01-01"'}], 1],
        [[{"deactivated": "false"}], 4],
        [[{"deactivated": "true"}], 1],
        [[{"isVolunteer": "true"}], 2],
        [[{"isVolunteer": "false"}], 3],
        [[{"registered": "true"}], 3],
        [[{"registered": "false"}], 2],
        [[{"signed": "true"}], 0],
        [[{"signed": "false"}], 5],
        [[{"genders": "[Male]"}], 2],
        [[{"genders": "[Female]"}], 1],
        [[{"genders": "[Diverse]"}], 2],
        [[{"genders": "[Male,Female]"}], 3],
        [[{"tagIds": "[1]"}], 2],
        [[{"tagIds": "[3]"}], 1],
        [[{"excludedTagIds": "[1]"}], 3],
        [[{"excludedTagIds": "[3]"}], 4],
        [[{"pattern": '"Body"'}], 4],
        [[{"pattern": '"fun"'}], 1],
        [[{"pattern": '"Z"'}], 0],
        [[{"pattern": '"1234"'}], 3],
        [[{"pattern": '"123"'}], 1],
        [[{"pattern": '"491"'}], 1],
        [[{"pattern": '"web.com"'}], 1],
        [[{"pattern": '"uk"'}], 1],
        [[{"createdFrom": '"2022-01-01"'}, {"deactivated": "false"}], 2],
        [[{"deactivated": "false"}, {"registered": "false"}], 1],
        [[{"deactivated": "true"}, {"pattern": '"no"'}], 1],
        [[{"isVolunteer": "true"}, {"registered": "true"}], 0],
        [[{"genders": "[Male]"}, {"tagIds": "[1]"}], 2],
        [[{"excludedTagIds": "[1]"}, {"deactivated": "false"}], 2],
    ],
    ids=_format,
)
def test_beneficiaries_filtered_query(client, filters, number):
    # Test case 9.1.3
    filter_input = ", ".join(f"{k}: {v}" for f in filters for k, v in f.items())
    query = f"""query {{ beneficiaries(filterInput: {{ {filter_input} }}) {{
                elements {{
                    id
                    isVolunteer
                    registered
                }} }} }}"""
    beneficiaries = assert_successful_request(client, query)["elements"]
    assert len(beneficiaries) == number

    for f in filters:
        for name in ["isVolunteer", "registered"]:
            if name in f:
                value = f[name] == "true"
                assert [b[name] for b in beneficiaries] == number * [value]


def test_beneficiary_rows_query(client):
    # Base 1 holds 5 beneficiaries (#1, #2, #3, #5, #6). Deactivated beneficiaries
    # (here: #2) are included by default; this is controlled via
    # FilterBeneficiaryInput.deactivated only
    query = """query { beneficiaryRows(baseId: 1) {
            totalNumberOfBeneficiaries
            page {
                id
                firstName
                lastName
                gender
                age
                familyHeadId
                familyHeadLastName
                groupIdentifier
                tokens
                tagIds
                comment
                lastActiveOn
                createdOn
                email
                phoneNumber
                customTextField1
                customTextField2
                customNumberField
                customDateField
                soonToBeDeactivated
                signed
                } } }"""
    result = assert_successful_request(client, query)
    assert result["totalNumberOfBeneficiaries"] == 5
    # Default sort: LastName ascending, i.e. by the last name of the family head (or
    # the beneficiary's own last name for heads). Heads #1 and #6, and members #2 and
    # #5 (all "Body") precede head #3 ("One"); ties are resolved by ascending ID
    assert [row["id"] for row in result["page"]] == ["1", "2", "5", "6", "3"]
    family_head_last_names = {
        row["id"]: row["familyHeadLastName"] for row in result["page"]
    }
    assert family_head_last_names == {
        "1": "Body",
        "2": "Body",
        "5": "Body",
        "6": "Body",
        "3": "One",
    }

    for page in [-1, 0]:
        query = f"""query {{ beneficiaryRows(baseId: 1, options: {{ page: {page} }}) {{
                totalNumberOfBeneficiaries
                page {{ id }}
                }} }}"""
        result = assert_successful_request(client, query)
        assert result["totalNumberOfBeneficiaries"] == 5
        assert len(result["page"]) == 5


def test_beneficiary_rows_filtering(client):
    # Beneficiaries #1 and #6 carry tag 1; #1 also carries tag 3. Filtering is applied
    # per beneficiary row, not per family: member #5 (also part of head #1's family)
    # does not carry the tag and is hence excluded
    query = """query { beneficiaryRows(baseId: 1,
                options: { filters: { tagIds: [1] } }) {
            totalNumberOfBeneficiaries
            page { id tagIds }
            } }"""
    result = assert_successful_request(client, query)
    assert result["totalNumberOfBeneficiaries"] == 2
    assert [row["id"] for row in result["page"]] == ["1", "6"]

    # Only beneficiary #3 is Female
    query = """query { beneficiaryRows(baseId: 1,
                options: { filters: { genders: [Female] } }) {
            totalNumberOfBeneficiaries
            page { id gender }
            } }"""
    result = assert_successful_request(client, query)
    assert result["totalNumberOfBeneficiaries"] == 1
    assert [row["id"] for row in result["page"]] == ["3"]

    # Empty result because no beneficiary matches the combination of filters
    query = """query { beneficiaryRows(baseId: 1, options: {
                filters: { genders: [Female], tagIds: [1] } }) {
            totalNumberOfBeneficiaries
            page { id }
            } }"""
    result = assert_successful_request(client, query)
    assert result["totalNumberOfBeneficiaries"] == 0
    assert result["page"] == []


@pytest.mark.parametrize("descending", [False, True])
@pytest.mark.parametrize(
    ["sort_by", "field"],
    [
        ("FirstName", "firstName"),
        ("Gender", "gender"),
        ("Age", "age"),
        ("GroupIdentifier", "groupIdentifier"),
        ("Tokens", "tokens"),
        ("LastActiveOn", "lastActiveOn"),
        ("CreatedOn", "createdOn"),
        ("Email", "email"),
        ("Phone", "phoneNumber"),
        ("CustomTextField1", "customTextField1"),
        ("CustomTextField2", "customTextField2"),
    ],
)
def test_beneficiary_rows_sorting(client, sort_by, field, descending):
    # The test data of base 1 is rather homogeneous for some fields. Diversify it (the
    # changes are rolled back at the end of the test)
    for beneficiary_id in [1, 3, 5, 6]:
        Beneficiary.update(
            phone_number=f"+49{beneficiary_id}11111",
            custom_text_field_2=f"text-{beneficiary_id}",
        ).where(Beneficiary.id == beneficiary_id).execute()

    # Exclude deactivated beneficiary #2 to keep the comparison restricted to the
    # diversified beneficiaries #1, #3, #5, #6
    query = f"""query {{ beneficiaryRows(
            baseId: 1,
            options: {{
                sortBy: {sort_by},
                descending: {str(descending).lower()},
                filters: {{ deactivated: false }}
            }}
        ) {{ page {{ id {field} }} }} }}"""
    page = assert_successful_request(client, query, field="beneficiaryRows")["page"]
    assert len(page) == 4

    def key(row):
        value = row[field]
        if isinstance(value, str):
            value = value.lower()
        # NULL values are sorted first in ascending order
        return (value is not None, value)

    # Ties are always resolved by ascending beneficiary ID, independent of direction.
    # Age is sorted via the underlying (inverted) dateOfBirth field, so NULL ages end
    # up on the opposite end compared to every other (non-inverted) field
    by_id = sorted(page, key=lambda row: int(row["id"]))
    reverse = not descending if field == "age" else descending
    expected = sorted(by_id, key=key, reverse=reverse)
    assert len({key(row) for row in page}) > 1  # test data is diverse
    assert [row["id"] for row in page] == [row["id"] for row in expected]


def test_beneficiary_rows_paging(client):
    # For any sort field, a page always consists of exactly `pageSize` beneficiaries
    def query_page(page, page_size, sort_by="CreatedOn"):
        query = f"""query {{ beneficiaryRows(
                baseId: 1,
                options: {{
                    page: {page}, pageSize: {page_size}, sortBy: {sort_by},
                    filters: {{ deactivated: false }}
                }}
            ) {{ totalNumberOfBeneficiaries page {{ id }} }} }}"""
        return assert_successful_request(client, query, field="beneficiaryRows")

    all_ids = [row["id"] for row in query_page(1, 100)["page"]]
    assert len(all_ids) == 4

    for page_size, number_of_pages in [(50, 1), (2, 2), (1, 4)]:
        paged_ids = []
        for page in range(1, number_of_pages + 1):
            result = query_page(page, page_size)
            assert result["totalNumberOfBeneficiaries"] == 4  # does not depend on page
            ids = [row["id"] for row in result["page"]]
            assert len(ids) == min(page_size, 4 - len(paged_ids))
            paged_ids.extend(ids)
        assert paged_ids == all_ids

    # Going past the last page returns an empty list
    result = query_page(5, 1)
    assert result["page"] == []
    assert result["totalNumberOfBeneficiaries"] == 4

    # For the default sort field (LastName), beneficiaries (deactivated ones
    # included, since no deactivated-filter is applied here) are sorted by the last
    # name of their family head (or their own last name, for heads). A page always
    # consists of exactly `pageSize` rows, even if this splits a family across pages:
    # head #1's family (members #2, #5) spans the first two pages below
    def query_last_name_page(page, page_size=1):
        query = f"""query {{ beneficiaryRows(
                baseId: 1, options: {{ page: {page}, pageSize: {page_size} }}
            ) {{ totalNumberOfBeneficiaries page {{ id }} }} }}"""
        return assert_successful_request(client, query, field="beneficiaryRows")

    # Full order: 1, 2, 5 (all family of head #1, "Body"), 6 ("Body"), 3 ("One")
    result = query_last_name_page(1, page_size=2)
    assert [row["id"] for row in result["page"]] == ["1", "2"]
    assert result["totalNumberOfBeneficiaries"] == 5

    result = query_last_name_page(2, page_size=2)
    assert [row["id"] for row in result["page"]] == ["5", "6"]  # family split here
    assert result["totalNumberOfBeneficiaries"] == 5

    result = query_last_name_page(3, page_size=2)
    assert [row["id"] for row in result["page"]] == ["3"]
    assert result["totalNumberOfBeneficiaries"] == 5

    result = query_last_name_page(4, page_size=2)
    assert result["page"] == []
    assert result["totalNumberOfBeneficiaries"] == 5


@pytest.mark.parametrize(
    ["days_since_last_active", "expected"],
    [
        # Base 1's days_to_keep_inactive_beneficiaries is 60, so the threshold is at
        # 60 - 14 = 46 days
        (46, False),
        (47, True),
    ],
)
def test_beneficiary_rows_soon_to_be_deactivated_boundary(
    client, days_since_last_active, expected
):
    last_active_on = date.today() - timedelta(days=days_since_last_active)
    Beneficiary.update(created_on=last_active_on, last_modified_on=None).where(
        Beneficiary.id == 1
    ).execute()

    query = """query { beneficiaryRows(baseId: 1,
                options: { filters: { deactivated: false } }) {
            page { id soonToBeDeactivated } } }"""
    page = assert_successful_request(client, query, field="beneficiaryRows")["page"]
    row = next(row for row in page if row["id"] == "1")
    assert row["soonToBeDeactivated"] is expected


def test_beneficiary_rows_last_active_on_with_missing_dates(client):
    last_modified_on = date.today() - timedelta(days=2)
    Beneficiary.update(created_on=None, last_modified_on=last_modified_on).where(
        Beneficiary.id == 1
    ).execute()
    Beneficiary.update(created_on=None, last_modified_on=None).where(
        Beneficiary.id == 6
    ).execute()

    query = """query { beneficiaryRows(baseId: 1) {
            page { id lastActiveOn soonToBeDeactivated } } }"""
    page = assert_successful_request(client, query, field="beneficiaryRows")["page"]
    rows = {row["id"]: row for row in page}

    assert rows["1"]["lastActiveOn"] == f"{last_modified_on.isoformat()}T00:00:00"
    assert rows["1"]["soonToBeDeactivated"] is False
    assert rows["6"]["lastActiveOn"] is None
    assert rows["6"]["soonToBeDeactivated"] is False

    # Additional tests deemed relevant but not implemented here:
    # - combining sortBy=LastName with filters (verifying that
    #   total_number_of_beneficiaries reflects per-row filtering, independent of
    #   family-head/member relationships, under the single-query paging mode)
    # - permission-scoped tag_relation/transaction checks beyond the generic
    #   base/beneficiary read-permission tests already added to test_permissions.py
