import pytest
from boxtribute_server.models.definitions.history import DbChangeHistory


def default_history_data():
    mock_history = {"id": 112, "changes": "Changes"}
    return mock_history


@pytest.fixture()
def default_history():
    return default_history_data()


def create():
    DbChangeHistory.create(**default_history_data())
