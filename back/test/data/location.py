import pytest
from boxtribute_server.models.definitions.location import Location
from data.base import data as base_data
from data.box_state import default_box_state_data
from data.user import default_user_data


def default_location_data():
    return {
        "id": 1,
        "box_state": default_box_state_data()["id"],
        "base": base_data()[0]["id"],
        "is_stockroom": 0,
        "deleted": None,
        "is_donated": 0,
        "is_lost": 0,
        "is_shop": True,
        "is_scrap": 0,
        "name": "Location",
        "seq": 1,
        "visible": 1,
        "created_by": default_user_data()["id"],
    }


@pytest.fixture()
def default_location():
    return default_location_data()


def another_location_data():
    data = default_location_data()
    data["id"] = 2
    data["base"] = base_data()[2]["id"]
    return data


@pytest.fixture()
def another_location():
    return another_location_data()


def create():
    Location.create(**default_location_data())
    Location.create(**another_location_data())
