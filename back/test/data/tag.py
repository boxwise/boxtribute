import pytest
from boxtribute_server.enums import TagType
from boxtribute_server.models.definitions.tag import Tag

from .base import data as base_data


def data():
    return [
        {
            "id": 1,
            "base": base_data()[0]["id"],
            "color": "red",
            "description": "important",
            "name": "group1",
            "type": TagType.Beneficiary,
            "deleted": None,
        },
        {
            "id": 2,
            "base": base_data()[0]["id"],
            "color": "blue",
            "description": "the description",
            "name": "pallet1",
            "type": TagType.Box,
            "deleted": None,
        },
        {
            "id": 3,
            "base": base_data()[0]["id"],
            "color": "green",
            "description": "for everything",
            "name": "tag-name",
            "type": TagType.All,
            "deleted": None,
        },
        {
            "id": 4,
            "base": base_data()[1]["id"],
            "color": "#000000",
            "description": "",
            "name": "new-tag-name",
            "type": TagType.All,
            "deleted": None,
        },
        {
            "id": 5,
            "base": base_data()[0]["id"],
            "color": "#ffffff",
            "description": "deleted because not required",
            "name": "group0",
            "type": TagType.Beneficiary,
            "deleted": "2022-01-01",
        },
    ]


@pytest.fixture
def tags():
    return data()


@pytest.fixture
def base1_active_tags():
    return data()[:3]


def create():
    Tag.insert_many(data()).execute()
