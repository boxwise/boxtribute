import pytest
from boxtribute_server.models.definitions.user import Usergroup


def data():
    return [
        {"id": 1, "name": "Head of Operations", "organisation": 1},
        {"id": 2, "name": "Coordinator", "organisation": 1},
        {"id": 3, "name": "Volunteer", "organisation": 1},
        {"id": 4, "name": "Head of Operations", "organisation": 2},
        {"id": 5, "name": "Coordinator", "organisation": 2},
        {"id": 6, "name": "Volunteer", "organisation": 2},
    ]


@pytest.fixture
def usergroups():
    return data()


def create():
    Usergroup.insert_many(data()).execute()
