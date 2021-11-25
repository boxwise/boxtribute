import pytest
from boxtribute_server.models.log import Log


def default_log_data():
    mock_log = {"id": 111, "content": "Content"}
    return mock_log


@pytest.fixture()
def default_log():
    return default_log_data()


def create_default_log():
    Log.create(**default_log_data())
