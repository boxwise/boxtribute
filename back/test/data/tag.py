import pytest
from boxtribute_server.models.definitions.tag import Tag


def data():
    return [
        {
            "id": 1,
            "base": 1,
            "color": "red",
            "description": "important",
            "name": "pallet1",
        },
    ]


@pytest.fixture
def tags():
    return data()


def create():
    Tag.insert_many(data()).execute()
