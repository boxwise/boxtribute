import pytest
from boxtribute_server.models.definitions.organisation import Organisation


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
        {
            "id": 3,
            "name": "Inactives",
        },
    ]


@pytest.fixture
def organisations():
    return data()


@pytest.fixture
def default_organisation():
    return data()[0]


@pytest.fixture
def another_organisation():
    return data()[1]


@pytest.fixture
def inactive_organisation():
    return data()[2]


def create():
    Organisation.insert_many(data()).execute()
