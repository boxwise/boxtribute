from datetime import datetime

import pytest
from boxtribute_server.models.definitions.services_relation import ServicesRelation

from .beneficiary import default_beneficiary_data
from .service import data as service_data


def data():
    return [
        {
            "id": 1,
            "beneficiary": default_beneficiary_data()["id"],
            "service": service_data()[0]["id"],
            "created_on": datetime(2025, 11, 24),
        },
    ]


@pytest.fixture
def default_service_relation():
    return data()[0]


def create():
    ServicesRelation.insert_many(data()).execute()
