import pytest
from boxtribute_server.models.definitions.size_range import SizeRange


def data():
    return [
        {"id": 1, "label": "the label", "seq": 1},
        {"id": 2, "label": "One size", "seq": 1},
        {
            "id": 3,
            "label": "Children by year (2-3, 4-5, 6-7, 8-9, 10-11, 12-13, 14-15)",
            "seq": 1,
        },
        {
            "id": 4,
            "label": "XS, S, M, L, XL",
            "seq": 1,
        },
        {"id": 28, "label": "Mass", "seq": 3},
        {"id": 29, "label": "Volume", "seq": 4},
    ]


def mass_dimension_data():
    return data()[4]


def volume_dimension_data():
    return data()[5]


@pytest.fixture
def size_ranges():
    return data()


@pytest.fixture
def default_size_range():
    return data()[0]


@pytest.fixture
def another_size_range():
    return data()[1]


def create():
    SizeRange.insert_many(data()).execute()
