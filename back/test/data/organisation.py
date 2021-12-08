import pytest
from boxtribute_server.models.organisation import Organisation


def data():
    return [
        {
            "id": 1,
            "name": "CoolOrganisation",
        },
        {
            "id": 2,
            "name": "Helpers",
        },
    ]


@pytest.fixture
def default_organisation():
    return data()[0]


@pytest.fixture
def another_organisation():
    return data()[1]


def create():
    Organisation.insert_many(data()).execute()
