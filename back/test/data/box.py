import pytest
from boxtribute_server.models.definitions.box import Box
from data.box_state import default_box_state_data
from data.location import default_location_data
from data.product import default_product_data
from data.qr_code import default_qr_code_data
from data.user import default_user_data


def default_box_data():
    return {
        "id": 2,
        "product": default_product_data()["id"],
        "label_identifier": "12345678",
        "state": default_box_state_data()["id"],
        "comment": "",
        "created_by": default_user_data()["id"],
        "items": 0,
        "location": default_location_data()["id"],
        "qr_code": default_qr_code_data()["id"],
    }


def box_without_qr_code_data():
    data = default_box_data().copy()
    data["id"] = 3
    data["label_identifier"] = "23456789"
    data["items"] = 10
    data["qr_code"] = None
    return data


@pytest.fixture()
def default_box():
    return default_box_data()


@pytest.fixture()
def box_without_qr_code():
    return box_without_qr_code_data()


def create():
    Box.create(**default_box_data())
    Box.create(**box_without_qr_code_data())
