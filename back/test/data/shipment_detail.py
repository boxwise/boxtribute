import pytest
from boxtribute_server.models.definitions.shipment_detail import ShipmentDetail
from boxtribute_server.models.utils import utcnow

from .box import (
    another_marked_for_shipment_box_data,
    box_without_qr_code_data,
    default_box_data,
    marked_for_shipment_box_data,
)
from .shipment import data as shipment_data
from .user import default_user_data, second_user_data

TIME = utcnow().replace(tzinfo=None)


def data():
    shipments = shipment_data()
    box_without_qr_code = box_without_qr_code_data()
    default_box = default_box_data()
    marked_for_shipment_box = marked_for_shipment_box_data()
    shippable_box = another_marked_for_shipment_box_data()
    return [
        {
            "id": 1,
            "shipment": shipments[3]["id"],  # sent shipment
            "box": box_without_qr_code["id"],
            "source_product": box_without_qr_code["product"],
            "source_location": box_without_qr_code["location"],
            "source_size": box_without_qr_code["size"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
            "removed_on": None,
            "removed_by": None,
        },
        {
            "id": 2,
            "shipment": shipments[3]["id"],  # sent shipment
            "box": marked_for_shipment_box["id"],
            "source_product": marked_for_shipment_box["product"],
            "source_location": marked_for_shipment_box["location"],
            "source_size": marked_for_shipment_box["size"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
            "removed_on": None,
            "removed_by": None,
        },
        {
            "id": 3,
            "shipment": shipments[0]["id"],  # preparing shipment
            "box": shippable_box["id"],
            "source_product": shippable_box["product"],
            "source_location": shippable_box["location"],
            "source_size": shippable_box["size"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
            "removed_on": None,
            "removed_by": None,
        },
        {
            "id": 4,
            "shipment": shipments[3]["id"],  # sent shipment
            "box": default_box["id"],
            "source_product": default_box["product"],
            "source_location": default_box["location"],
            "source_size": default_box["size"],
            "created_on": TIME,
            "created_by": default_user_data()["id"],
            "removed_on": TIME,
            "removed_by": second_user_data()["id"],
        },
    ]


@pytest.fixture
def default_shipment_detail():
    return data()[0]


@pytest.fixture
def another_shipment_detail():
    return data()[1]


@pytest.fixture
def prepared_shipment_detail():
    return data()[2]


@pytest.fixture
def removed_shipment_detail():
    return data()[3]


def create():
    ShipmentDetail.insert_many(data()).execute()
