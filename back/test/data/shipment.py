from datetime import datetime

import pytest
from boxtribute_server.models.enums import ShipmentState
from boxtribute_server.models.shipment import Shipment

from .base import data as base_data
from .transfer_agreement import data as transfer_agreement_data
from .user import default_user_data


def data():
    return {
        "id": 1,
        "source_base": base_data()[0]["id"],
        "target_base": base_data()[2]["id"],
        "transfer_agreement": transfer_agreement_data()["id"],
        "state": ShipmentState.PREPARING.value,
        "started_on": datetime.utcnow(),
        "started_by": default_user_data()["id"],
    }


@pytest.fixture
def default_shipment():
    return data()


def create():
    Shipment.create(**data())
