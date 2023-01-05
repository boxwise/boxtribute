from datetime import datetime

import pytest
from boxtribute_server.enums import BoxState, LocationType
from boxtribute_server.models.definitions.location import Location

from .base import data as base_data
from .box_state import default_box_state_data
from .user import default_user_data


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
        "is_stockroom": False,
        "is_scrap": 0,
        "name": "Location",
        "seq": 1,
        "visible": 1,
        "created_by": default_user_data()["id"],
        "type": LocationType.ClassicLocation,
        "latitude": None,
    }


@pytest.fixture()
def default_location():
    return default_location_data()


def another_location_data():
    data = default_location_data()
    data["id"] = 2
    data["base"] = base_data()[2]["id"]
    return data


def null_box_state_location_data():
    data = default_location_data()
    data["id"] = 3
    data["box_state"] = None
    return data


def non_default_box_state_location_data():
    data = default_location_data()
    data["id"] = 4
    data["box_state"] = BoxState.Donated
    return data


def distribution_spot_data():
    data = default_location_data()
    data["id"] = 5
    data["type"] = LocationType.DistributionSpot
    data["latitude"] = 13.37
    return data


def another_distribution_spot_data():
    data = default_location_data()
    data["id"] = 6
    data["base"] = base_data()[2]["id"]
    data["type"] = LocationType.DistributionSpot
    return data


def deleted_location_data():
    data = default_location_data()
    data["id"] = 7
    data["deleted"] = datetime(2021, 1, 1)
    return data


@pytest.fixture()
def another_location():
    return another_location_data()


@pytest.fixture()
def null_box_state_location():
    return null_box_state_location_data()


@pytest.fixture()
def non_default_box_state_location():
    return non_default_box_state_location_data()


@pytest.fixture()
def distribution_spot():
    return distribution_spot_data()


@pytest.fixture
def base1_classic_locations():
    return [
        default_location_data(),
        null_box_state_location_data(),
        non_default_box_state_location_data(),
        deleted_location_data(),
    ]


@pytest.fixture
def base1_undeleted_classic_locations():
    return [
        default_location_data(),
        null_box_state_location_data(),
        non_default_box_state_location_data(),
    ]


def create():
    Location.insert_many(
        [
            default_location_data(),
            another_location_data(),
            null_box_state_location_data(),
            non_default_box_state_location_data(),
            distribution_spot_data(),
            another_distribution_spot_data(),
            deleted_location_data(),
        ]
    ).execute()
