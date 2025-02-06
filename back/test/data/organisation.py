import pytest
from boxtribute_server.models.definitions.organisation import Organisation
from boxtribute_server.models.utils import utcnow

now = utcnow()


def data():
    return [
        {
            "id": 1,
            "name": "CoolOrganisation",
            "deleted_on": None,
        },
        {
            "id": 2,
            "name": "Helpers",
            "deleted_on": None,
        },
        {
            "id": 3,
            "name": "Inactives",
            "deleted_on": now,
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
