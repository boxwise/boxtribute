import pytest
from boxtribute_server.models.definitions.base import Base
from data.organisation import data as organisation_data


def data():
    return [
        {
            "id": 1,
            "name": "the best name",
            "currency_name": "dingo dollars",
            "seq": 1,
            "organisation_id": organisation_data()[0]["id"],
        },
        {
            "id": 2,
            "name": "the second best name",
            "currency_name": "monster munch",
            "seq": 1,
            "organisation_id": organisation_data()[0]["id"],
        },
        {
            "id": 3,
            "name": "harold",
            "currency_name": "mustard",
            "seq": 1,
            "organisation_id": organisation_data()[1]["id"],
        },
    ]


@pytest.fixture()
def default_base():
    return data()[0]


@pytest.fixture()
def default_bases():
    return {b["id"]: b for b in data()}


def create():
    Base.insert_many(data()).execute()
