import pytest
from boxtribute_server.models.definitions.size import Size


def default_data():
    return {"id": 1, "label": "small"}


def another_data():
    return {"id": 2, "label": "medium"}


@pytest.fixture
def default_size():
    return default_data()


@pytest.fixture
def another_size():
    return another_data()


def create():
    Size.create(**default_data())
    Size.create(**another_data())
