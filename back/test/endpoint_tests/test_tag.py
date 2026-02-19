import time
from datetime import date, datetime

import pytest
from boxtribute_server.enums import TagType
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.utils import (
    HISTORY_CREATION_MESSAGE,
    HISTORY_DELETION_MESSAGE,
)
from utils import (
    assert_bad_user_input,
    assert_forbidden_request,
    assert_successful_request,
)

today = date.today().isoformat()


def test_tag_query(client, tags):
    # Test case 4.1.2
    tag = tags[0]
    tag_id = str(tag["id"])
    query = f"""query {{ tag(id: {tag_id}) {{
            id name type
            createdOn
            createdBy {{ id }}
            lastModifiedOn
            lastModifiedBy {{ id }}
            lastUsedOn
        }} }}"""
    queried_tag = assert_successful_request(client, query)
    assert queried_tag == {
        "id": tag_id,
        "name": tag["name"],
        "type": tag["type"].name,
        "createdOn": tag["created_on"].isoformat() + "+00:00",
        "createdBy": {"id": str(tag["created_by"])},
        "lastModifiedOn": None,
        "lastModifiedBy": None,
        "lastUsedOn": datetime(2023, 1, 1).isoformat() + "+00:00",
    }


def test_tags_query(
    client,
    tags,
    default_beneficiary,
    another_male_beneficiary,
    default_box,
    box_without_qr_code,
    in_transit_box,
):
    # Test case 4.1.1
    query = """query { tags {
                id
                name
                type
                taggedResources {
                    __typename
                    ...on Beneficiary { id }
                    ...on Box { id }
                } } }"""
    queried_tags = assert_successful_request(client, query)
    assert queried_tags == [
        {
            "id": str(tags[0]["id"]),
            "name": tags[0]["name"],
            "type": tags[0]["type"].name,
            "taggedResources": [
                {
                    "__typename": "Beneficiary",
                    "id": str(default_beneficiary["id"]),
                },
                {
                    "__typename": "Beneficiary",
                    "id": str(another_male_beneficiary["id"]),
                },
            ],
        },
        {
            "id": str(tags[1]["id"]),
            "name": tags[1]["name"],
            "type": tags[1]["type"].name,
            "taggedResources": [
                {
                    "__typename": "Box",
                    "id": str(default_box["id"]),
                },
            ],
        },
        {
            "id": str(tags[2]["id"]),
            "name": tags[2]["name"],
            "type": tags[2]["type"].name,
            "taggedResources": [
                {
                    "__typename": "Beneficiary",
                    "id": str(default_beneficiary["id"]),
                },
                {
                    "__typename": "Box",
                    "id": str(default_box["id"]),
                },
                {
                    "__typename": "Box",
                    "id": str(box_without_qr_code["id"]),
                },
                {
                    "__typename": "Box",
                    "id": str(in_transit_box["id"]),
                },
            ],
        },
        {
            "id": str(tags[5]["id"]),
            "name": tags[5]["name"],
            "type": tags[5]["type"].name,
            "taggedResources": [],
        },
    ]


def test_tags_mutations(client, tags, base1_active_tags, another_beneficiary, lost_box):
    # Test case 4.2.9
    deleted_tag_id = tags[0]["id"]
    mutation = f"""mutation {{ deleteTag(id: {deleted_tag_id}) {{
                ...on Tag {{
                    name
                    deletedOn
                    taggedResources {{
                        ...on Beneficiary {{ id }}
                        ...on Box {{ id }}
                    }}
                }}
            }} }}"""
    deleted_tag = assert_successful_request(client, mutation)
    # Expect tag to be unassigned from any resource it was assigned to (see
    # test/data/tags_relation.py)
    deleted_on = deleted_tag.pop("deletedOn")
    assert deleted_on.startswith(today)
    assert deleted_tag == {"name": tags[0]["name"], "taggedResources": []}

    query = """query { tags { id } }"""
    all_tags = assert_successful_request(client, query)
    # Expect the deleted tag to not appear in the list of active tags of base
    assert all_tags == [{"id": str(t["id"])} for t in base1_active_tags[1:]]

    time.sleep(1)
    response = assert_successful_request(client, mutation)
    assert response["deletedOn"] == deleted_on

    # Test case 4.2.1
    name = "Box Group 1"
    description = "Boxes for donation"
    color = "#ff0000"
    type = TagType.All.name
    base_id = "1"
    creation_input = f"""{{
        name: "{name}",
        description: "{description}",
        color: "{color}",
        type: {type}
        baseId: {base_id}
    }}"""

    mutation = f"""mutation {{
            createTag(
                creationInput : {creation_input}
            ) {{
                ...on Tag {{
                    id
                    name
                    description
                    color
                    type
                    createdOn
                    createdBy {{ id }}
                    lastModifiedOn
                    lastModifiedBy {{ id }}
                    lastUsedOn
                    base {{ id }}
                    taggedResources {{
                        ...on Beneficiary {{ id }}
                        ...on Box {{ id }}
                    }}
                }}
            }}
        }}"""

    created_tag = assert_successful_request(client, mutation)
    tag_id = created_tag.pop("id")
    assert created_tag.pop("createdOn").startswith(today)
    assert created_tag == {
        "name": name,
        "description": description,
        "color": color,
        "type": type,
        "taggedResources": [],
        "base": {"id": base_id},
        "createdBy": {"id": "8"},
        "lastModifiedOn": None,
        "lastModifiedBy": None,
        "lastUsedOn": None,
    }

    # Test case 4.2.3
    for field, value in zip(
        ["name", "description", "color"], ["Another Box Group", "", "#c0ffee"]
    ):
        update_input = f"""{{
            id: {tag_id},
            {field}: "{value}"
        }}"""
        mutation = f"""mutation {{
                updateTag(updateInput : {update_input}) {{
                    ...on Tag {{
                        id
                        {field}
                        type
                        lastModifiedOn
                        lastModifiedBy {{ id }}
                    }}
                }} }}"""
        updated_tag = assert_successful_request(client, mutation)
        assert updated_tag.pop("lastModifiedOn").startswith(today)
        assert updated_tag == {
            "id": tag_id,
            field: value,
            "type": type,
            "lastModifiedBy": {"id": "8"},
        }

    # Test case 4.2.13
    box_id = str(lost_box["id"])
    mutation = f"""mutation {{
                assignTag(assignmentInput: {{
                    id: {tag_id}
                    resourceId: {box_id}
                    resourceType: Box
                }} ) {{
                    ...on Box {{ tags {{ id }} }}
                }} }}"""
    box = assert_successful_request(client, mutation)
    assert box == {"tags": [{"id": tag_id}]}
    # Verify that tag can only be assigned once
    box = assert_successful_request(client, mutation)
    assert box == {"tags": [{"id": tag_id}]}

    # Test case 4.2.14
    beneficiary_id = str(another_beneficiary["id"])
    mutation = f"""mutation {{
                assignTag(assignmentInput: {{
                    id: {tag_id}
                    resourceId: {beneficiary_id}
                    resourceType: Beneficiary
                }} ) {{
                    ...on Beneficiary {{ tags {{ id }} }}
                }} }}"""
    beneficiary = assert_successful_request(client, mutation)
    assert beneficiary == {"tags": [{"id": tag_id}]}

    query = f"""query {{ tag( id: {tag_id} ) {{
                taggedResources {{
                    ...on Beneficiary {{ id }}
                    ...on Box {{ id }}
                }}
                lastUsedOn
    }} }}"""
    tag = assert_successful_request(client, query)
    assert tag.pop("lastUsedOn").startswith(today)
    assert tag == {"taggedResources": [{"id": i} for i in [beneficiary_id, box_id]]}

    # Test case 4.2.27
    mutation = f"""mutation {{
                unassignTag(unassignmentInput: {{
                    id: {tag_id}
                    resourceId: {box_id}
                    resourceType: Box
                }} ) {{
                    ...on Box {{ tags {{ id }} }}
                }} }}"""
    box = assert_successful_request(client, mutation)
    assert box == {"tags": []}

    # Test case 4.2.28
    mutation = f"""mutation {{
                unassignTag(unassignmentInput: {{
                    id: {tag_id}
                    resourceId: {beneficiary_id}
                    resourceType: Beneficiary
                }} ) {{
                    ...on Beneficiary {{ tags {{ id }} }}
                }} }}"""
    beneficiary = assert_successful_request(client, mutation)
    assert beneficiary == {"tags": []}

    tag = assert_successful_request(client, query)
    assert tag.pop("lastUsedOn").startswith(today)
    assert tag == {"taggedResources": []}

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "tags")
        .dicts()
    )
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": HISTORY_DELETION_MESSAGE,
            "record_id": int(deleted_tag_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": HISTORY_CREATION_MESSAGE,
            "record_id": int(tag_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'label changed from "{name}" to "Another Box Group";',
            "record_id": int(tag_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'description changed from "{description}" to "";',
            "record_id": int(tag_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": f'color changed from "{color}" to "#c0ffee";',
            "record_id": int(tag_id),
            "from_int": None,
            "to_int": None,
        },
    ]


@pytest.mark.parametrize(
    "tag_id,tag_type,tagged_resource_ids,typename",
    [
        [1, TagType.Box.name, [], "Box"],
        [2, TagType.Beneficiary.name, [], "Beneficiary"],
        [3, TagType.Box.name, [2, 3, 9], "Box"],
        [3, TagType.Beneficiary.name, [1], "Beneficiary"],
        [1, TagType.All.name, [1, 6], "Beneficiary"],
    ],
)
def test_update_tag_type(client, tag_id, tag_type, tagged_resource_ids, typename):
    # Test case 4.2.4
    mutation = f"""mutation {{ updateTag(
            updateInput: {{ id: {tag_id}, type: {tag_type} }}) {{
                ...on Tag {{
                    type
                    taggedResources {{
                        __typename
                        ...on Beneficiary {{ id }}
                        ...on Box {{ id }}
                    }}
                }}
    }} }}"""
    updated_tag = assert_successful_request(client, mutation)
    assert updated_tag == {
        "type": tag_type,
        "taggedResources": [
            {"id": str(i), "__typename": typename} for i in tagged_resource_ids
        ],
    }


def test_assign_tag_with_invalid_base(client, tags):
    tag_id = tags[3]["id"]
    # Test case 4.2.39
    assignment_input = f"""{{
        id: {tag_id}
        resourceId: 2
        resourceType: Box
    }}"""
    mutation = f"""mutation {{
            assignTag( assignmentInput: {assignment_input} ) {{
                ...on Box {{ id }} }} }}"""
    assert_forbidden_request(client, mutation)

    # Test case 4.2.40
    mutation = f"""mutation {{
            unassignTag( unassignmentInput: {assignment_input} ) {{
                ...on Box {{ id }} }} }}"""
    assert_forbidden_request(client, mutation)


def test_assign_tag_with_invalid_resource_type(
    client, tags, another_beneficiary, default_box
):
    # Test case 4.2.23
    box_tag_id = tags[1]["id"]
    beneficiary_id = another_beneficiary["id"]
    mutation = f"""mutation {{
                assignTag(assignmentInput: {{
                    id: {box_tag_id}
                    resourceId: {beneficiary_id}
                    resourceType: Beneficiary
                }} ) {{
                    ...on Beneficiary {{ tags {{ id }} }}
                }} }}"""
    assert_bad_user_input(client, mutation)

    # Test case 4.2.24
    beneficiary_tag_id = tags[0]["id"]
    box_id = default_box["id"]
    mutation = f"""mutation {{
                assignTag(assignmentInput: {{
                    id: {beneficiary_tag_id}
                    resourceId: {box_id}
                    resourceType: Box
                }} ) {{
                    ...on Box {{ tags {{ id }} }}
                }} }}"""
    assert_bad_user_input(client, mutation)


@pytest.mark.parametrize(
    "filter_input,tag_ids",
    [
        ["", ["1", "2", "3", "6"]],
        ["(resourceType: Box)", ["2", "3", "6"]],
        ["(resourceType: Beneficiary)", ["1", "3", "6"]],
    ],
)
def test_base_tags_query(client, filter_input, tag_ids):
    query = f"""query {{ base(id: 1) {{ tags{filter_input} {{ id }} }} }}"""
    tags = assert_successful_request(client, query)["tags"]
    assert tags == [{"id": i} for i in tag_ids]


def test_create_tag_with_invalid_color(client):
    # Test case 4.2.41
    creation_input = """{
        name: "Invalid Color Tag",
        color: "not-a-color",
        type: All
        baseId: 1
    }"""
    mutation = f"""mutation {{
            createTag(creationInput : {creation_input}) {{
                __typename
                ...on Tag {{ id }}
                ...on InvalidColorError {{ color }}
            }}
        }}"""
    result = assert_successful_request(client, mutation)
    assert result["__typename"] == "InvalidColorError"
    assert result["color"] == "not-a-color"


def test_update_tag_with_invalid_color(client, tags):
    # Test case 4.2.42
    tag_id = tags[0]["id"]
    mutation = f"""mutation {{ updateTag(
            updateInput: {{ id: {tag_id}, color: "invalid" }}) {{
                __typename
                ...on Tag {{ id }}
                ...on InvalidColorError {{ color }}
            }} }}"""
    result = assert_successful_request(client, mutation)
    assert result["__typename"] == "InvalidColorError"
    assert result["color"] == "invalid"


def test_update_tag_with_empty_name(client, tags):
    # Test case 4.2.43
    tag_id = tags[0]["id"]
    mutation = f"""mutation {{ updateTag(
            updateInput: {{ id: {tag_id}, name: "" }}) {{
                __typename
                ...on Tag {{ id }}
                ...on EmptyNameError {{ __typename }}
            }} }}"""
    result = assert_successful_request(client, mutation)
    assert result["__typename"] == "EmptyNameError"


def test_update_deleted_tag(client, tags):
    # Test case 4.2.44
    tag_id = tags[4]["id"]  # Deleted tag in test data
    mutation = f"""mutation {{ updateTag(
            updateInput: {{ id: {tag_id}, name: "New Name" }}) {{
                __typename
                ...on Tag {{ id }}
                ...on DeletedTagError {{ name }}
            }} }}"""
    result = assert_successful_request(client, mutation)
    assert result["__typename"] == "DeletedTagError"
    assert result["name"] == tags[4]["name"]


def test_delete_tags(client, tags):
    beneficiary_tag_id = str(tags[0]["id"])
    box_tag_id = str(tags[1]["id"])
    tag_from_another_base_id = str(tags[3]["id"])
    deleted_tag_id = str(tags[4]["id"])
    non_existing_tag_id = "999"

    # Test case 4.2.45
    mutation = f"""mutation {{ deleteTags
        (ids: [{beneficiary_tag_id}, {box_tag_id}]) {{
                ...on TagsResult {{
                    invalidTagIds
                    updatedTags {{
                        id
                        deletedOn
                        taggedResources {{ __typename }}
                    }} }} }} }}"""
    result = assert_successful_request(client, mutation)
    assert result["updatedTags"][0].pop("deletedOn").startswith(today)
    assert result["updatedTags"][1].pop("deletedOn").startswith(today)
    assert result == {
        "invalidTagIds": [],
        "updatedTags": [
            {
                "id": beneficiary_tag_id,
                "taggedResources": [],
            },
            {
                "id": box_tag_id,
                "taggedResources": [],
            },
        ],
    }

    # Test case 4.2.46, 4.2.47, 4.2.48
    mutation = f"""mutation {{ deleteTags
        (ids: [{tag_from_another_base_id}, {non_existing_tag_id}, {deleted_tag_id}]) {{
                ...on TagsResult {{
                    invalidTagIds
                    updatedTags {{ id }}
                    }} }} }}"""
    result = assert_successful_request(client, mutation)
    assert result == {
        "invalidTagIds": [
            tag_from_another_base_id,
            deleted_tag_id,
            non_existing_tag_id,
        ],
        "updatedTags": [],
    }

    history_entries = list(
        DbChangeHistory.select(
            DbChangeHistory.changes,
            DbChangeHistory.change_date,
            DbChangeHistory.record_id,
            DbChangeHistory.from_int,
            DbChangeHistory.to_int,
        )
        .where(DbChangeHistory.table_name == "tags")
        .dicts()
    )
    for i in range(len(history_entries)):
        assert history_entries[i].pop("change_date").isoformat().startswith(today)
    assert history_entries == [
        {
            "changes": HISTORY_DELETION_MESSAGE,
            "record_id": int(beneficiary_tag_id),
            "from_int": None,
            "to_int": None,
        },
        {
            "changes": HISTORY_DELETION_MESSAGE,
            "record_id": int(box_tag_id),
            "from_int": None,
            "to_int": None,
        },
    ]
