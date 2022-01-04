import pytest
from boxtribute_server.models.definitions.shipment_detail import ShipmentDetail
from boxtribute_server.models.utils import utcnow
from data.box import box_without_qr_code_data, default_box_data
from data.shipment import data as shipment_data
from data.user import default_user_data

TIME = utcnow().replace(tzinfo=None)


def data():
    default_box = default_box_data()
    shipment = shipment_data()[3]
    prepared_box = box_without_qr_code_data()
    prepared_shipment = shipment_data()[0]
    return [
        {
            "id": 1,
            "shipment": shipment["id"],
            "box": default_box["id"],
            "source_product": default_box["product"],
            "source_location": default_box["location"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
        },
        {
            "id": 2,
            "shipment": prepared_shipment["id"],
            "box": prepared_box["id"],
            "source_product": prepared_box["product"],
            "source_location": prepared_box["location"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
        },
    ]


@pytest.fixture
def default_shipment_detail():
    return data()[0]


@pytest.fixture
def prepared_shipment_detail():
    return data()[1]


def create():
    ShipmentDetail.insert_many(data()).execute()
