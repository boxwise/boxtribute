import pytest
from boxtribute_server.enums import ShipmentState
from boxtribute_server.models.definitions.shipment import Shipment
from boxtribute_server.models.utils import utcnow

from .base import data as base_data
from .transfer_agreement import data as transfer_agreement_data
from .user import default_user_data

TIME = utcnow().replace(tzinfo=None)


def data():
    return [
        {
            "id": 1,
            "source_base": base_data()[0]["id"],
            "target_base": base_data()[2]["id"],
            "transfer_agreement": transfer_agreement_data()[0]["id"],
            "state": ShipmentState.Preparing,
            "started_by": default_user_data()["id"],
            "started_on": TIME,
        },
        {
            "id": 2,
            "source_base": base_data()[0]["id"],
            "target_base": base_data()[2]["id"],
            "transfer_agreement": transfer_agreement_data()[1]["id"],
            "state": ShipmentState.Canceled,
            "started_by": default_user_data()["id"],
            "started_on": TIME,
        },
        {
            "id": 3,
            "source_base": base_data()[2]["id"],
            "target_base": base_data()[0]["id"],
            "transfer_agreement": transfer_agreement_data()[3]["id"],
            "state": ShipmentState.Preparing,
            "started_by": default_user_data()["id"],
            "started_on": TIME,
        },
    ]


@pytest.fixture
def default_shipment():
    return data()[0]


@pytest.fixture
def canceled_shipment():
    return data()[1]


@pytest.fixture
def another_shipment():
    return data()[2]


def create():
    Shipment.insert_many(data()).execute()
