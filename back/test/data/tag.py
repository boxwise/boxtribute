import pytest
from boxtribute_server.enums import TagType
from boxtribute_server.models.definitions.tag import Tag
from data.base import data as base_data


def data():
    return [
        {
            "id": 1,
            "base": base_data()[0]["id"],
            "color": "red",
            "description": "important",
            "name": "group1",
            "type": TagType.Beneficiary,
        },
        {
            "id": 2,
            "base": base_data()[0]["id"],
            "color": "blue",
            "description": "the description",
            "name": "pallet1",
            "type": TagType.Box,
        },
        {
            "id": 3,
            "base": base_data()[0]["id"],
            "color": "green",
            "description": "for everything",
            "name": "tag-name",
            "type": TagType.All,
        },
    ]


@pytest.fixture
def tags():
    return data()


def create():
    Tag.insert_many(data()).execute()
