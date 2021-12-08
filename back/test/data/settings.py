import pytest
from boxtribute_server.models.settings import Settings


def default_settings_data():
    mock_settings = {
        "id": 111,
        "category_id": 8,
        "code": "CODE",
    }
    return mock_settings


@pytest.fixture()
def default_settings():
    return default_settings_data()


def create():
    Settings.create(**default_settings_data())
