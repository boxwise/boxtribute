import pytest
from boxtribute_server.models.definitions.size import Size

from .size_range import data as size_range_data


def default_data():
    return {"id": 1, "label": "small", "size_range": size_range_data()["id"]}


def another_data():
    return {"id": 2, "label": "medium", "size_range": size_range_data()["id"]}


@pytest.fixture
def default_size():
    return default_data()


@pytest.fixture
def another_size():
    return another_data()


def create():
    Size.create(**default_data())
    Size.create(**another_data())
