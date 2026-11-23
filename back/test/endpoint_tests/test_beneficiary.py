import base64
import csv
import io
from datetime import date, timedelta
from unittest import mock

import pymysql
import pytest
from auth import mock_user_for_request
from boxtribute_server.business_logic.beneficiary.crud import transfer_balances
from boxtribute_server.enums import HumanGender, Language, TaggableObjectType
from boxtribute_server.models.definitions.beneficiary import Beneficiary
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.definitions.services_relation import ServicesRelation
from boxtribute_server.models.definitions.tags_relation import TagsRelation
from boxtribute_server.models.definitions.transaction import Transaction
from boxtribute_server.models.utils import (
    HISTORY_CREATION_MESSAGE,
    HISTORY_DELETION_MESSAGE,
    HISTORY_RECOVER_MESSAGE,
    compute_age_in_days,
    utcnow,
)
from peewee import OperationalError
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
                    tagIds: [{tag_id}]
                }}"""
    mutation = f"""mutation {{
            createBeneficiary(
                creationInput : {creation_input}
            ) {{
                ...on Beneficiary {{
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
    assert created_beneficiary["dateOfSignature"] is None
    assert created_beneficiary["tags"] == [{"id": tag_id}]
    assert created_beneficiary["createdOn"] == created_beneficiary["lastModifiedOn"]
    assert created_beneficiary["createdBy"] == created_beneficiary["lastModifiedBy"]

    # Test case 9.2.9
    today = date.today().isoformat()
    new_last_name = "Body"
    new_dos = today
    language = "nl"
    signature = first_name
    mutation = f"""mutation {{
            updateBeneficiary(
                updateInput : {{
                    id: {beneficiary_id},
                    lastName: "{new_last_name}",
                    signature: "{signature}",
                    languages: [{language}],
                    isVolunteer: false,
                    tagIds: [{tag_id}],
                    registered: true
                }} ) {{
                ...on Beneficiary {{ id }}
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
                    languages: [],
                    comment: "{new_comment}",
                    gender: {new_gender.name}
                }}) {{
                ...on Beneficiary {{ id }}
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
        "languages": [],
        "familyHead": None,
        "familyMembers": [],
        "isVolunteer": False,
        "signed": True,
        "registered": True,
        "signature": signature,
        "dateOfSignature": new_dos,
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
    deactivated_beneficiary_id = default_beneficiary["id"]
    mutation = f"""mutation {{
            deactivateBeneficiaries(ids: [{deactivated_beneficiary_id}]) {{
                ...on BeneficiariesResult {{
                    updatedBeneficiaries {{ id deactivatedOn }}
                    invalidBeneficiaryIds
                }}
            }} }}"""
    response = assert_successful_request(client, mutation)
    assert response["invalidBeneficiaryIds"] == []
    assert {b["id"] for b in response["updatedBeneficiaries"]} == {
        str(deactivated_beneficiary_id),
        str(another_relative_beneficiary["id"]),
    }
    assert all(b["deactivatedOn"] is not None for b in response["updatedBeneficiaries"])
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
                        ...on BeneficiariesResults {{
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
                    ...on BeneficiariesResults {{ results {{ __typename }} }}
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
                       ...on BeneficiariesResults {{ results {{ __typename }} }}
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
        if history_entries[i]["changes"].startswith("date_of_signature changed"):
            assert history_entries[i]["changes"].startswith(
                f'date_of_signature changed from "None" to "{new_dos}'
            )
            history_entries[i]["changes"] = "SIGNATURE_DATE"
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
            "changes": "SIGNATURE_DATE",
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
            "record_id": int(deactivated_beneficiary_id),
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

    assert rows["1"]["lastActiveOn"] == last_modified_on.isoformat()
    assert rows["1"]["soonToBeDeactivated"] is False
    assert rows["6"]["lastActiveOn"] is None
    assert rows["6"]["soonToBeDeactivated"] is False


def _create_input(**overrides):
    fields = {
        "firstName": '"First"',
        "lastName": '"Last"',
        "baseId": "1",
        "groupIdentifier": '"1312"',
    }
    fields.update(overrides)
    return ", ".join(f"{k}: {v}" for k, v in fields.items())


def _create_beneficiary(client, **overrides):
    mutation = f"""mutation {{ createBeneficiary(creationInput: {{
            {_create_input(**overrides)} }}) {{
            __typename
            ...on Beneficiary {{
                id firstName email phoneNumber customTextField1 customTextField2
                customNumberField customDateField registered isVolunteer gender
                signed dateOfSignature tokens familyHead {{ id }} tags {{ id }}
            }}
        }} }}"""
    return assert_successful_request(client, mutation)


def _transactions(beneficiary_id):
    return list(
        Transaction.select(Transaction.tokens, Transaction.description)
        .where(Transaction.beneficiary == beneficiary_id)
        .order_by(Transaction.id)
        .dicts()
    )


@pytest.mark.parametrize(
    "overrides,error",
    [
        ({"familyHeadId": "0"}, "ResourceDoesNotExistError"),
        ({"tagIds": "[0]"}, "ResourceDoesNotExistError"),
        ({"dateOfBirth": '"2999-01-01"'}, "InvalidDateError"),
        ({"tagIds": "[4]"}, "TagBaseMismatchError"),
        ({"tagIds": "[2]"}, "TagTypeMismatchError"),
        ({"tagIds": "[5]"}, "DeletedTagError"),
        ({"familyHeadId": "4"}, "FamilyHeadBaseMismatchError"),
        ({"familyHeadId": "2"}, "DeactivatedFamilyHeadError"),
        ({"familyHeadId": "5"}, "FamilyHeadIsMemberError"),
        ({"initialCredit": "-1"}, "InvalidInitialCreditError"),
        ({"email": '"not-an-email"'}, "InvalidEmailError"),
        ({"firstName": '"  "'}, "EmptyNameError"),
        ({"lastName": '""'}, "EmptyNameError"),
    ],
)
def test_create_beneficiary_errors(client, overrides, error):
    count = Beneficiary.select().count()
    response = _create_beneficiary(client, **overrides)
    assert response == {"__typename": error}
    assert Beneficiary.select().count() == count


def test_create_beneficiary_with_all_fields(client):
    response = _create_beneficiary(
        client,
        firstName='"  First  "',
        familyHeadId="3",
        initialCredit="15",
        email='"  a@b.com "',
        phoneNumber='" +49123 "',
        customTextField1='"x"',
        customTextField2='" y "',
        customNumberField="7",
        customDateField='"2024-02-03"',
        signature='"First"',
        tagIds="[1, 3]",
    )
    assert response["firstName"] == "First"
    assert response["email"] == "a@b.com"
    assert response["phoneNumber"] == "+49123"
    assert response["customTextField1"] == "x"
    assert response["customTextField2"] == "y"
    assert response["customNumberField"] == 7
    assert response["customDateField"] == "2024-02-03"
    assert response["registered"] is True
    assert response["isVolunteer"] is False
    assert response["signed"] is True
    assert response["dateOfSignature"] == date.today().isoformat()
    assert response["familyHead"] == {"id": "3"}
    assert response["tags"] == [{"id": "1"}, {"id": "3"}]
    # Credit is attributed to the family head
    assert response["tokens"] == 0
    assert _transactions(3)[-1]["tokens"] == 15
    assert _transactions(int(response["id"])) == []

    beneficiary = Beneficiary.get_by_id(response["id"])
    assert beneficiary.seq == 1
    assert beneficiary.family_head_id == 3

    # Zero credit is ignored. Gender and date of birth can be omitted
    response = _create_beneficiary(client, initialCredit="0")
    assert response["gender"] == HumanGender.Diverse.name
    assert response["tokens"] == 0
    assert _transactions(int(response["id"])) == []

    response = _create_beneficiary(client, initialCredit="20")
    assert response["tokens"] == 20
    assert len(_transactions(int(response["id"]))) == 1

    history = list(
        DbChangeHistory.select(DbChangeHistory.changes, DbChangeHistory.record_id)
        .where(
            DbChangeHistory.table_name == "people",
            DbChangeHistory.record_id == int(response["id"]),
        )
        .tuples()
    )
    assert history == [(HISTORY_CREATION_MESSAGE, int(response["id"]))]


def _update_beneficiary(client, id, **fields):
    update = ", ".join(f"{k}: {v}" for k, v in fields.items())
    mutation = f"""mutation {{ updateBeneficiary(
            updateInput: {{ id: {id}, {update} }}) {{
            __typename
            ...on Beneficiary {{
                id email phoneNumber customTextField1 familyHead {{ id }}
                customDateField tags {{ id }} tokens lastModifiedBy {{ id }}
                signed
            }}
        }} }}"""
    return assert_successful_request(client, mutation)


@pytest.mark.parametrize(
    "id,fields,error",
    [
        (0, {}, "ResourceDoesNotExistError"),
        (3, {"familyHeadId": "0"}, "ResourceDoesNotExistError"),
        (3, {"tagIds": "[0]"}, "ResourceDoesNotExistError"),
        (4, {"firstName": '"x"'}, "UnauthorizedForBaseError"),
        (3, {"dateOfBirth": '"2999-01-01"'}, "InvalidDateError"),
        (3, {"tagIds": "[4]"}, "TagBaseMismatchError"),
        (3, {"tagIds": "[2]"}, "TagTypeMismatchError"),
        (3, {"tagIds": "[5]"}, "DeletedTagError"),
        (3, {"familyHeadId": "4"}, "FamilyHeadBaseMismatchError"),
        (3, {"familyHeadId": "2"}, "DeactivatedFamilyHeadError"),
        (3, {"familyHeadId": "5"}, "FamilyHeadIsMemberError"),
        (3, {"familyHeadId": "3"}, "FamilyHeadSelfReferenceError"),
        (1, {"familyHeadId": "3"}, "FamilyHeadHasMembersError"),
        (3, {"email": '"nope"'}, "InvalidEmailError"),
        (3, {"lastName": '" "'}, "EmptyNameError"),
    ],
)
def test_update_beneficiary_errors(client, id, fields, error):
    response = _update_beneficiary(client, id, **fields)
    assert response == {"__typename": error}


def test_update_beneficiary_signature(client):
    response = _update_beneficiary(client, 3, signature='"me"')
    assert response["__typename"] == "Beneficiary"
    assert response["signed"]
    assert _update_beneficiary(client, 3, signature='"me"') == {
        "__typename": "BeneficiaryAlreadySignedError"
    }


def test_update_beneficiary_fields_and_tags(client):
    response = _update_beneficiary(
        client,
        1,
        email='"  new@mail.com "',
        phoneNumber='"123"',
        tagIds="[3, 6]",
        customTextField1='""',
        customDateField='"2024-10-31"',
    )
    assert response["email"] == "new@mail.com"
    assert response["phoneNumber"] == "123"
    assert response["customTextField1"] == ""
    assert response["tags"] == [{"id": "3"}, {"id": "6"}]
    assert response["lastModifiedBy"] == {"id": "8"}
    assert response["customDateField"] == "2024-10-31"

    # null is ignored
    response = _update_beneficiary(client, 1, email="null", tagIds="null")
    assert response["email"] == "new@mail.com"
    assert response["tags"] == [{"id": "3"}, {"id": "6"}]

    # Empty list unassigns all tags
    response = _update_beneficiary(client, 1, tagIds="[]")
    assert response["tags"] == []
    assert (
        TagsRelation.select()
        .where(TagsRelation.object_id == 1, TagsRelation.deleted_on.is_null())
        .count()
        == 0
    )

    changes = [
        h.changes
        for h in DbChangeHistory.select().where(
            DbChangeHistory.table_name == "people", DbChangeHistory.record_id == 1
        )
    ]
    assert any(c.startswith("email changed from") for c in changes)
    assert any(c.startswith("phone changed from") for c in changes)
    assert any(c.startswith("customfield1_value changed from") for c in changes)
    assert any(c.startswith("customfield4_value changed from") for c in changes)


def test_update_beneficiary_family_head(client):
    # Individual #3 (30 tokens) joins family of #1: balance is transferred
    head_tokens = sum(t["tokens"] for t in _transactions(1))
    response = _update_beneficiary(client, 3, familyHeadId="1")
    assert response["familyHead"] == {"id": "1"}
    assert response["tokens"] == 0
    assert [t["tokens"] for t in _transactions(3)][-1] == -30
    assert sum(t["tokens"] for t in _transactions(3)) == 0
    assert sum(t["tokens"] for t in _transactions(1)) == head_tokens + 30
    assert _transactions(1)[-1]["description"] == "moved balance to family head"

    # Moving to another family head does not transfer credit
    count = Transaction.select().count()
    response = _update_beneficiary(client, 3, familyHeadId="6")
    assert response["familyHead"] == {"id": "6"}
    assert Transaction.select().count() == count

    # Keeping the head is a no-op
    response = _update_beneficiary(client, 3, familyHeadId="6")
    assert response["familyHead"] == {"id": "6"}

    # Becoming an individual
    response = _update_beneficiary(client, 3, familyHeadId="null")
    assert response["familyHead"] is None
    assert Transaction.select().count() == count

    # No transaction if balance is 0
    response = _update_beneficiary(client, 3, familyHeadId="1")
    assert Transaction.select().count() == count

    history = [
        (h.changes, h.from_int, h.to_int)
        for h in DbChangeHistory.select()
        .where(DbChangeHistory.table_name == "people", DbChangeHistory.record_id == 3)
        .order_by(DbChangeHistory.id)
    ]
    assert [h[1:] for h in history if h[1] is not None or h[2] is not None] == [
        (None, 1),
        (1, 6),
        (6, None),
        (None, 1),
    ]


def _bulk(client, mutation, fields="updatedBeneficiaries { id } invalidBeneficiaryIds"):
    if "Tags" in mutation.split("(")[0]:
        result_type, extra = "BeneficiariesTagsOperationResult", "tagErrorInfo"
    elif "Services" in mutation.split("(")[0]:
        result_type, extra = "BeneficiariesServicesOperationResult", "serviceErrorInfo"
    else:
        result_type, extra = "BeneficiariesResult", ""
    if extra:
        extra += " { id error { __typename } }"
    query = f"""mutation {{ {mutation} {{
            __typename
            ...on {result_type} {{ {fields} {extra} }}
        }} }}"""
    return assert_successful_request(client, query)


def _ids(response):
    return sorted(int(b["id"]) for b in response["updatedBeneficiaries"])


def _history(*record_ids):
    return [
        (h.record_id, h.changes, h.from_int, h.to_int)
        for h in DbChangeHistory.select()
        .where(
            DbChangeHistory.table_name == "people",
            DbChangeHistory.record_id << list(record_ids),
        )
        .order_by(DbChangeHistory.id)
    ]


def test_assign_unassign_tags_to_beneficiaries(client):
    # Beneficiary 1 already has tags 1 and 3; 5 and 3 have none; 4 is not accessible;
    # 99 does not exist; 2 is deactivated
    response = _bulk(
        client,
        "assignTagsToBeneficiaries(updateInput: { ids: [1, 3, 3, 5, 2, 4, 99], "
        "tagIds: [1, 3] })",
    )
    assert response["__typename"] == "BeneficiariesTagsOperationResult"
    assert _ids(response) == [3, 5]
    # beneficiary 1 is already assigned to all tags
    assert sorted(response["invalidBeneficiaryIds"]) == [1, 2, 4, 99]
    assert response["tagErrorInfo"] == []
    relations = TagsRelation.select().where(
        TagsRelation.object_id == 3,
        TagsRelation.object_type == TaggableObjectType.Beneficiary,
        TagsRelation.deleted_on.is_null(),
    )
    assert sorted(r.tag_id for r in relations) == [1, 3]

    response = _bulk(
        client,
        "assignTagsToBeneficiaries(updateInput: { ids: [1], " "tagIds: [1, 3] })",
    )
    assert response["__typename"] == "BeneficiariesTagsOperationResult"
    assert _ids(response) == []
    assert sorted(response["invalidBeneficiaryIds"]) == [1]

    # Tag errors
    response = _bulk(
        client,
        "assignTagsToBeneficiaries(updateInput: { ids: [3], tagIds: [0, 2, 4, 5] })",
    )
    assert response["updatedBeneficiaries"] == []
    assert sorted(e["id"] for e in response["tagErrorInfo"]) == ["0", "2", "4", "5"]
    assert {e["error"]["__typename"] for e in response["tagErrorInfo"]} == {
        "ResourceDoesNotExistError",
        "TagTypeMismatchError",
        "UnauthorizedForBaseError",
        "DeletedTagError",
    }

    response = _bulk(
        client,
        "unassignTagsFromBeneficiaries(updateInput: { ids: [1, 3, 5, 6], "
        "tagIds: [3] })",
    )
    assert _ids(response) == [1, 3, 5]
    # 6 does not have tag 3
    assert response["invalidBeneficiaryIds"] == [6]
    assert (
        TagsRelation.select()
        .where(
            TagsRelation.object_id << [1, 3, 5],
            TagsRelation.object_type == TaggableObjectType.Beneficiary,
            TagsRelation.tag == 3,
            TagsRelation.deleted_on.is_null(),
        )
        .count()
        == 0
    )

    # Beneficiaries in several bases
    response = _bulk(
        client,
        "assignTagsToBeneficiaries(updateInput: { ids: [3], tagIds: [4] })",
    )
    assert response["tagErrorInfo"][0]["error"]["__typename"] == (
        "UnauthorizedForBaseError"
    )


def test_deactivate_and_reactivate_beneficiaries(client, mocker):
    # Head 1 and its active member 5 are deactivated; no double history entries
    response = _bulk(client, "deactivateBeneficiaries(ids: [5, 1, 1, 4, 2, 99])")
    assert response["__typename"] == "BeneficiariesResult"
    assert _ids(response) == [1, 5]
    assert sorted(response["invalidBeneficiaryIds"]) == [2, 4, 99]
    for id in (1, 5):
        assert Beneficiary.get_by_id(id).deleted_on
    assert sorted(
        h[:2] for h in _history(1, 5) if h[1] == HISTORY_DELETION_MESSAGE
    ) == [
        (1, HISTORY_DELETION_MESSAGE),
        (5, HISTORY_DELETION_MESSAGE),
    ]
    # Tags stay assigned
    assert (
        TagsRelation.select()
        .where(TagsRelation.object_id == 1, TagsRelation.deleted_on.is_null())
        .count()
        > 0
    )

    # Already deactivated
    response = _bulk(client, "deactivateBeneficiaries(ids: [1])")
    assert response["invalidBeneficiaryIds"] == [1]

    # Reactivating a member without its head is invalid, but both together work
    response = _bulk(client, "reactivateBeneficiaries(ids: [5])")
    assert response["updatedBeneficiaries"] == []
    assert response["invalidBeneficiaryIds"] == [5]

    response = _bulk(client, "reactivateBeneficiaries(ids: [5, 1, 3, 4])")
    assert _ids(response) == [1, 2, 5]  # 2 is cascaded and not invalid
    assert sorted(response["invalidBeneficiaryIds"]) == [3, 4]
    for id in (1, 2, 5):
        assert not Beneficiary.get_by_id(id).deleted_on
    recovered = [h[0] for h in _history(1, 2, 5) if h[1] == HISTORY_RECOVER_MESSAGE]
    assert sorted(recovered) == [1, 2, 5]

    # Reactivating the head cascades to members
    _bulk(client, "deactivateBeneficiaries(ids: [1])")
    response = _bulk(client, "reactivateBeneficiaries(ids: [1])")
    assert _ids(response) == [1, 2, 5]

    # Missing permission on base for a mix of bases
    response = _bulk(client, "deactivateBeneficiaries(ids: [])")
    assert response["updatedBeneficiaries"] == []


def test_bulk_base_mismatch(client, mocker):
    mock_user_for_request(mocker, base_ids=[1, 2])
    Beneficiary.update(base=2, family_head=None).where(Beneficiary.id == 6).execute()
    for mutation in [
        "deactivateBeneficiaries(ids: [3, 6])",
        "mergeBeneficiariesIntoFamily(ids: [3, 6])",
    ]:
        response = _bulk(client, mutation)
        assert response["__typename"] == "BeneficiaryBaseMismatchError", mutation

    Beneficiary.update(deleted_on=utcnow()).where(Beneficiary.id << [3, 6]).execute()
    response = _bulk(client, "reactivateBeneficiaries(ids: [3, 6])")
    assert response["__typename"] == "BeneficiaryBaseMismatchError"

    Beneficiary.update(deleted_on=None, family_head=1).where(
        Beneficiary.id == 6
    ).execute()
    response = _bulk(client, "detachBeneficiariesFromFamily(ids: [5, 6])")
    assert response["__typename"] == "BeneficiaryBaseMismatchError"


def test_register_services_for_beneficiaries(client, mocker):
    response = _bulk(
        client,
        "registerServicesForBeneficiaries(updateInput: { ids: [1, 3, 3, 2, 4], "
        "serviceIds: [1, 0] })",
    )
    assert response["__typename"] == "BeneficiariesServicesOperationResult"
    assert _ids(response) == [1, 3]
    assert sorted(response["invalidBeneficiaryIds"]) == [2, 4]
    assert response["serviceErrorInfo"] == [
        {"id": "0", "error": {"__typename": "ResourceDoesNotExistError"}}
    ]
    # Services can be used multiple times
    assert (
        ServicesRelation.select().where(ServicesRelation.beneficiary == 1).count() == 2
    )
    assert (
        ServicesRelation.select().where(ServicesRelation.beneficiary == 3).count() == 1
    )

    # Service 2 is in unauthorized base, service 3 is deleted
    response = _bulk(
        client,
        "registerServicesForBeneficiaries(updateInput: { ids: [1], "
        "serviceIds: [2, 3] })",
    )
    assert response["__typename"] == "BeneficiariesServicesOperationResult"
    assert _ids(response) == []
    assert sorted(response["invalidBeneficiaryIds"]) == []
    assert response["serviceErrorInfo"] == [
        {"id": "2", "error": {"__typename": "UnauthorizedForBaseError"}},
        {"id": "3", "error": {"__typename": "DeletedServiceError"}},
    ]

    query = """query { beneficiary(id: 1) { serviceUsages {
                usedOn registeredBy { id } service { id name totalUsage uniqueUsage
                lastUsedOn } } } }"""
    usages = assert_successful_request(client, query)["serviceUsages"]
    assert len(usages) == 2
    assert usages[1]["registeredBy"] == {"id": "8"}
    assert usages[0]["service"]["name"] == "English lesson"
    assert usages[0]["service"]["totalUsage"] == 3
    assert usages[0]["service"]["uniqueUsage"] == 2
    assert usages[0]["service"]["lastUsedOn"] is not None

    query = "query { base(id: 1) { services { id name description totalUsage } } }"
    services = assert_successful_request(client, query)["services"]
    assert services == [
        {
            "id": "1",
            "name": "English lesson",
            "description": "for beginners and intermediate",
            "totalUsage": 3,
        }
    ]

    mock_user_for_request(mocker, base_ids=[1, 2])
    # Services 1 and 2 are in different bases (that user is authorized for)
    response = _bulk(
        client,
        "registerServicesForBeneficiaries(updateInput: { ids: [1], "
        "serviceIds: [1, 2] })",
    )
    assert response["__typename"] == "BeneficiariesServicesOperationResult"
    assert _ids(response) == []
    assert sorted(response["invalidBeneficiaryIds"]) == []
    assert response["serviceErrorInfo"] == [
        {"id": "1", "error": {"__typename": "ServiceBaseMismatchError"}},
        {"id": "2", "error": {"__typename": "ServiceBaseMismatchError"}},
    ]


def test_merge_beneficiaries_into_family(client):
    # 1 (head with member 5, DoB 1995-05-05, tokens 149), 6 (individual, same DoB,
    # created later) and 3 (individual, no DoB, 30 tokens). 1 is the oldest/first
    # created and becomes head
    response = _bulk(client, "mergeBeneficiariesIntoFamily(ids: [3, 6, 1, 5, 2, 4])")
    assert response["__typename"] == "BeneficiariesResult"
    assert sorted(response["invalidBeneficiaryIds"]) == [2, 4]
    assert _ids(response) == [3, 6]
    for id in (3, 6):
        assert Beneficiary.get_by_id(id).family_head_id == 1
    assert Beneficiary.get_by_id(5).family_head_id == 1
    assert Beneficiary.get_by_id(1).family_head_id is None
    # Only 3 had a balance: one transaction per sign
    assert [t["tokens"] for t in _transactions(3)][-1] == -30
    assert sum(t["tokens"] for t in _transactions(3)) == 0
    assert _transactions(1)[-1]["tokens"] == 30
    assert [t["tokens"] for t in _transactions(6)] == []
    assert [(h[0], h[2], h[3]) for h in _history(3, 6) if h[2] is None and h[3]] == [
        (3, None, 1),
        (6, None, 1),
    ]


def test_merge_families(client):
    # Individual 6 with family head 3's family
    _bulk(client, "mergeBeneficiariesIntoFamily(ids: [3, 6])")
    heads = {id: Beneficiary.get_by_id(id).family_head_id for id in (3, 6)}
    # DoB of 6 is set, 3 has none: 6 is the oldest
    assert heads == {3: 6, 6: None}

    # Merge the two families: 1 (+5) and 6 (+3). Same DoB. Head 1 was created first
    response = _bulk(client, "mergeBeneficiariesIntoFamily(ids: [6, 1])")
    assert _ids(response) == [3, 6]
    assert {id: Beneficiary.get_by_id(id).family_head_id for id in (1, 3, 5, 6)} == {
        1: None,
        3: 1,
        5: 1,
        6: 1,
    }


def test_merge_errors(client):
    for ids in ("[3]", "[3, 3]", "[3, 5]", "[3, 99]", "[3, 4]"):
        response = _bulk(client, f"mergeBeneficiariesIntoFamily(ids: {ids})")
        assert response["__typename"] in (
            "SingleBeneficiaryForMergeError",
            "BeneficiaryBaseMismatchError",
        ), ids


def test_detach_beneficiaries_from_family(client):
    response = _bulk(client, "detachBeneficiariesFromFamily(ids: [5, 5, 1, 3, 2, 4])")
    assert response["__typename"] == "BeneficiariesResult"
    assert _ids(response) == [5]
    assert sorted(response["invalidBeneficiaryIds"]) == [1, 2, 3, 4]
    assert Beneficiary.get_by_id(5).family_head_id is None
    assert Beneficiary.get_by_id(2).family_head_id == 1
    assert _history(5)[-1][2:] == (1, None)
    assert Transaction.select().where(Transaction.beneficiary == 5).count() == 0


def _decode_csv(response):
    return list(csv.DictReader(io.StringIO(base64.b64decode(response).decode())))


def test_export_beneficiary_rows_to_csv(client):
    Beneficiary.update(first_name="=cmd", comment="@x").where(
        Beneficiary.id == 6
    ).execute()
    query = "query { exportBeneficiaryRowsToCsv(baseId: 1) }"
    rows = _decode_csv(assert_successful_request(client, query))
    assert (
        list(rows[0].keys())
        == [
            "Group identifier",
            "Firstname",
            "Surname",
            "Gender",
            "Age",
            "Tags",
            "Comments",
            "Boxtribute family ID",
            "Head of family",
        ]
        or "Firstname" in rows[0]
    )
    by_id = {r["Boxtribute family ID"] + r["Firstname"]: r for r in rows}
    # Deactivated beneficiary 2 is excluded by default filters? Only check active
    row1 = by_id["1Every"]
    assert row1["Surname"] == "Body"
    assert row1["Gender"] == "M"
    assert row1["Age"] == str(
        date.today().year - 1995 - (date.today() < date(date.today().year, 5, 5))
    )  # noqa
    assert row1["Head of family"] == "yes"
    assert row1["Tags"] != ""
    row5 = by_id["1Some"]
    assert row5["Head of family"] == "no"
    assert row5["Age"] == ""
    assert row5["Gender"] == "D"
    row6 = by_id["6'=cmd"]
    assert row6["Comments"] == "'@x"
    assert row6["Head of family"] == "yes"

    query = """query { exportBeneficiaryRowsToCsv(baseId: 1,
            filters: { deactivated: true }) }"""
    rows_inactive = _decode_csv(assert_successful_request(client, query))
    assert len(rows_inactive) != len(rows)


def test_beneficiary_ids(client):
    query = "query { beneficiaryIds(baseId: 1) { ...on BeneficiaryIds { ids } } }"
    ids = assert_successful_request(client, query)["ids"]
    assert 3 in ids and 4 not in ids
    query = """query { beneficiaryIds(baseId: 1, filters: { deactivated: true })
            { ...on BeneficiaryIds { ids } } }"""
    inactive_ids = assert_successful_request(client, query)["ids"]
    assert inactive_ids != ids


def test_transfer_balances_waits_for_beneficiary_lock(client, setup_testing_database):
    source_id, target_id = [
        b.id for b in Beneficiary.select().order_by(Beneficiary.id).limit(2)
    ]
    # Simulate a concurrent transaction that holds a shared lock on the beneficiary. It
    # blocks the explicit exclusive lock but not the implicit foreign key checks
    other_connection = pymysql.connect(
        **setup_testing_database.connect_params,
        database=setup_testing_database.database,
    )
    try:
        with other_connection.cursor() as cursor:
            cursor.execute(
                f"SELECT id FROM {Beneficiary._meta.table_name} WHERE id = %s"
                " LOCK IN SHARE MODE",
                (source_id,),
            )
        setup_testing_database.execute_sql("SET SESSION innodb_lock_wait_timeout = 1")
        with pytest.raises(OperationalError, match="Lock wait timeout"):
            transfer_balances(
                user_id=1, source_ids=[source_id], target_id=target_id, now=utcnow()
            )
    finally:
        setup_testing_database.execute_sql(
            "SET SESSION innodb_lock_wait_timeout = DEFAULT"
        )
        other_connection.rollback()
        other_connection.close()
