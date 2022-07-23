from datetime import datetime
from test.data.location import distribution_spot_data

import pytest
from boxtribute_server.enums import DistributionEventState, LocationType
from boxtribute_server.models.definitions.location import Location


def default_distribution_event_data():
    return {
        "id": 1,
        "name": "Distribution Test Event 1",
        "planned_start_date_time": datetime(2023, 5, 5, 10, 00),
        "planned_end_date_time": datetime(2023, 5, 5, 11, 00),
        "distribution_spot_id": distribution_spot_data()["id"],
        "state": DistributionEventState.Planning,
        "type": LocationType.Location,
    }


@pytest.fixture()
def default_distribution_event():
    return default_distribution_event_data()


def create():
    Location.create(**default_distribution_event_data())
