from utils import assert_successful_request


def test_tags_query(
    read_only_client, tags, default_beneficiary, default_box, box_without_qr_code
):
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
