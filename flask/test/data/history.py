import pytest
from boxwise_flask.models.history import DbChangeHistory


def default_history_data():
    mock_history = {"id": 112, "changes": "Changes"}
    return mock_history


@pytest.fixture()
def default_history():
    return default_history_data()


def create_default_history():
    DbChangeHistory.create(**default_history_data())
