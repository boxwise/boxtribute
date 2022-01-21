import pytest
from boxtribute_server.models.definitions.size import Size


def data():
    return {"id": 1, "label": "small"}


@pytest.fixture
def default_size():
    return data()


def create():
    Size.create(**data())
