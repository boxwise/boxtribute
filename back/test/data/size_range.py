import pytest
from boxtribute_server.models.definitions.size_range import SizeRange


def data():
    return {"id": 1, "label": "the label", "seq": 1}


@pytest.fixture
def default_size_range():
    return data()


def create():
    SizeRange.create(**data())
