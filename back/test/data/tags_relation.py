import pytest
from boxtribute_server.enums import TagType
from boxtribute_server.models.definitions.tags_relation import TagsRelation
from data.beneficiary import default_beneficiary_data
from data.tag import data as tag_data


def data():
    return [
        {
            "object_id": default_beneficiary_data()["id"],
            "object_type": TagType.Beneficiary.value,
            "tag": tag_data()[0]["id"],
        },
    ]


@pytest.fixture
def tags_relations():
    return data()


def create():
    TagsRelation.insert_many(data()).execute()
