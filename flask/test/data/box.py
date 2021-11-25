from datetime import datetime

import pytest
from boxtribute_server.models.box import Box
from data.box_state import default_box_state_data
from data.location import default_location_data
from data.product import default_product_data
from data.qr_code import default_qr_code_data
from data.user import default_user_data

TIME = datetime.now()


def default_box_data():
    mock_box = {
        "id": 2,
        "product": default_product_data()["id"],
        "box_label_identifier": "12345678",
        "box_state": default_box_state_data()["id"],
        "comment": "",
        "created_on": TIME,
        "created_by": default_user_data()["id"],
        "deleted": TIME,
        "items": "None",
        "location": default_location_data()["id"],
        "qr_code": default_qr_code_data()["id"],
    }

    return mock_box


def box_without_qr_code_data():
    data = default_box_data().copy()
    data["id"] = 3
    data["box_label_identifier"] = "23456789"
    data["items"] = 10
    data["qr_code"] = None
    return data


@pytest.fixture()
def default_box():
    return default_box_data()


@pytest.fixture()
def box_without_qr_code():
    return box_without_qr_code_data()


def create_default_box():
    Box.create(**default_box_data())
    Box.create(**box_without_qr_code_data())
