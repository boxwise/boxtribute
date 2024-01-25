import pytest
from boxtribute_server.models.definitions.base import Base

from .organisation import data as organisation_data


def data():
    return [
        {
            "id": 1,
            "name": "the best name",
            "currency_name": "dingo dollars",
            "seq": 1,
            "organisation": organisation_data()[0]["id"],
        },
        {
            "id": 2,
            "name": "Aßlar",
            "currency_name": "monster munch",
            "seq": 1,
            "organisation": organisation_data()[0]["id"],
        },
        {
            "id": 3,
            "name": "Würzburg",
            "currency_name": "mustard",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
        },
        {
            "id": 4,
            "name": "second base",
            "currency_name": "pounds",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
        },
    ]


@pytest.fixture
def default_base():
    return data()[0]


@pytest.fixture
def another_base():
    return data()[2]


@pytest.fixture
def default_bases():
    return data()


def create():
    Base.insert_many(data()).execute()
