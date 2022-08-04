from boxtribute_server.enums import TagType
from utils import assert_forbidden_request, assert_successful_request


def test_tag_query(read_only_client, tags):
    # Test case 4.1.2
    tag = tags[0]
    tag_id = str(tag["id"])
    query = f"query {{ tag(id: {tag_id}) {{ id name type }} }}"
    queried_tag = assert_successful_request(read_only_client, query)
    assert queried_tag == {
        "id": tag_id,
        "name": tag["name"],
        "type": tag["type"].name,
    }


def test_tags_query(
    read_only_client, tags, default_beneficiary, default_box, box_without_qr_code
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
    queried_tags = assert_successful_request(read_only_client, query)
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
                    "id": str(box_without_qr_code["id"]),
                },
            ],
        },
    ]


def test_tags_mutations(client):
    # Test case 4.2.1
    name = "Box Group 1"
    description = "Boxes for donation"
    color = "#ff0000"
    type = TagType.All.name
    base_id = "1"
    tags_input_string = f"""{{
        name: "{name}",
        description: "{description}",
        color: "{color}",
        type: {type}
        baseId: {base_id}
    }}"""

    mutation = f"""mutation {{
            createTag(
                creationInput : {tags_input_string}
            ) {{
                id
                name
                description
                color
                type
                base {{ id }}
                taggedResources {{
                    ...on Beneficiary {{ id }}
                    ...on Box {{ id }}
                }}
            }}
        }}"""

    created_tag = assert_successful_request(client, mutation)
    tag_id = created_tag.pop("id")
    assert created_tag == {
        "name": name,
        "description": description,
        "color": color,
        "type": type,
        "taggedResources": [],
        "base": {"id": base_id},
    }

    # Test case 4.2.3
    for field, value in zip(
        ["name", "description", "color"], ["Another Box Group", "", "#c0ffee"]
    ):
        tags_input_string = f"""{{
            id: {tag_id},
            {field}: "{value}"
        }}"""
        mutation = f"""mutation {{
                updateTag(updateInput : {tags_input_string}) {{
                    id
                    {field}
                    type
                }} }}"""
        updated_tag = assert_successful_request(client, mutation)
        assert updated_tag == {
            "id": tag_id,
            field: value,
            "type": type,
        }


def test_create_tag_with_invalid_base(client, default_bases):
    # Test case 4.2.2
    base_id = default_bases[2]["id"]
    tags_input_string = f"""{{
        name: "new tag",
        color: "#112233",
        type: {TagType.All.name}
        baseId: {base_id}
    }}"""

    mutation = f"""mutation {{
            createTag(creationInput : {tags_input_string}) {{ id }} }}"""
    assert_forbidden_request(client, mutation)
