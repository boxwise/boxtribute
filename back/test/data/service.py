from datetime import date

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
            "deleted_on": None,
        },
        {
            "id": 2,
            "name": "Sewing course",
            "description": "for all",
            "base": base_data()[1]["id"],
            "deleted_on": None,
        },
        {
            "id": 3,
            "name": "Outdated",
            "description": "for all",
            "base": base_data()[0]["id"],
            "deleted_on": date(2026, 1, 1),
        },
    ]


@pytest.fixture
def english_lesson_service():
    return data()[0]


def create():
    Service.insert_many(data()).execute()
