import pytest
from boxtribute_server.models.definitions.size import Size


def default_size_data():
    return {"id": 1, "label": "small"}


def another_size_data():
    return {"id": 2, "label": "medium"}


def mixed_size_data():
    return {"id": 3, "label": "Mixed"}


def data():
    return [default_size_data(), another_size_data(), mixed_size_data()]


@pytest.fixture
def default_size():
    return default_size_data()


@pytest.fixture
def another_size():
    return another_size_data()


@pytest.fixture
def mixed_size():
    return mixed_size_data()


@pytest.fixture
def sizes():
    return data()


def create():
    Size.insert_many(data()).execute()
