import pytest
from boxtribute_server.models.definitions.service import Service

from .base import data as base_data


def data():
    return [
        {
            "id": 1,
            "name": "English lesson",
            "description": "for beginners and intermediate",
            "base": base_data()[0]["id"],
        },
    ]


@pytest.fixture
def english_lesson_service():
    return data()[0]


def create():
    Service.insert_many(data()).execute()
