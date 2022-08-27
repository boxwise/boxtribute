from datetime import datetime

import pytest
from boxtribute_server.enums import DistributionEventState
from boxtribute_server.models.definitions.distribution_event import DistributionEvent

from .classic_location import distribution_spot_data


def default_distribution_event_data():
    return {
        "id": 1,
        "name": "Distribution Test Event 1",
        "planned_start_date_time": datetime(2023, 5, 5, 10, 00),
        "planned_end_date_time": datetime(2023, 5, 5, 11, 00),
        "distribution_spot": distribution_spot_data()["id"],
        "state": DistributionEventState.Planning,
    }


@pytest.fixture()
def default_distribution_event():
    return default_distribution_event_data()


def create():
    DistributionEvent.create(**default_distribution_event_data())
