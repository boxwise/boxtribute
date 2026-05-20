import pytest
from boxtribute_server.models.definitions.size import Size


def default_size_data():
    return {"id": 1, "label": "small"}


def another_size_data():
    return {"id": 2, "label": "medium"}


def mixed_size_data():
    return {"id": 3, "label": "Mixed"}


@pytest.fixture
def default_size():
    return default_size_data()


@pytest.fixture
def another_size():
    return another_size_data()


@pytest.fixture
def mixed_size():
    return mixed_size_data()


def create():
    Size.create(**default_size_data())
    Size.create(**another_size_data())
    Size.create(**mixed_size_data())
