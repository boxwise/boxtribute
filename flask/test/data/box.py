from datetime import datetime

import pytest
from boxwise_flask.models.box import Box
from data.box_state import default_box_state_data
from data.location import default_location_data
from data.product import default_product_data
from data.qr_code import default_qr_code_data

TIME = datetime.now()


def default_box_data():
    mock_box = {
        "id": 2,
        "product": default_product_data()["id"],
        "box_label_identifier": "abc",
        "box_state": default_box_state_data()["id"],
        "comment": "",
        "created_on": TIME,
        "created_by": None,
        "deleted": TIME,
        "items": "None",
        "location": default_location_data()["id"],
        "qr_id": default_qr_code_data()["id"],
    }

    return mock_box


@pytest.fixture()
def default_box():
    return default_box_data()


def create_default_box():
    Box.create(**default_box_data())
