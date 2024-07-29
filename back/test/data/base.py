from datetime import datetime

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
            "deleted_on": None,
        },
        {
            "id": 2,
            "name": "Aßlar",
            "currency_name": "monster munch",
            "seq": 1,
            "organisation": organisation_data()[0]["id"],
            "deleted_on": None,
        },
        {
            "id": 3,
            "name": "Würzburg",
            "currency_name": "mustard",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
            "deleted_on": None,
        },
        {
            "id": 4,
            "name": "second base",
            "currency_name": "pounds",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
            "deleted_on": None,
        },
        {
            "id": 5,
            "name": "third base",
            "currency_name": "euro",
            "seq": 1,
            "organisation": organisation_data()[2]["id"],
            "deleted_on": datetime(2023, 1, 1),
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
