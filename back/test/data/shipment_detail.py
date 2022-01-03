import pytest
from boxtribute_server.models.definitions.shipment_detail import ShipmentDetail
from data.box import default_box_data
from data.shipment import data as shipment_data


def data():
    default_box = default_box_data()
    shipment = shipment_data()[3]
    return [
        {
            "id": 1,
            "shipment": shipment["id"],
            "box": default_box["id"],
            "source_product": default_box["product"],
            "source_location": default_box["location"],
            "created_on": shipment["started_on"],
            "created_by": shipment["started_by"],
        },
    ]


@pytest.fixture
def default_shipment_detail():
    return data()[0]


def create():
    ShipmentDetail.insert_many(data()).execute()
