import pytest
from boxwise_flask.models.location import Location
from data.base import default_base_data
from data.box_state import default_box_state_data


def default_location_data():
    mock_location = {
        "id": 1,
        "box_state": default_box_state_data()["id"],
        "base": default_base_data()["id"],
        "is_stockroom": 0,
        "deleted": None,
        "is_donated": 0,
        "is_lost": 0,
        "is_market": 0,
        "is_scrap": 0,
        "name": 1,
        "seq": 1,
        "visible": 1,
    }

    return mock_location


@pytest.fixture()
def default_location():
    return default_location_data()


def create_default_location():
    Location.create(**default_location_data())
