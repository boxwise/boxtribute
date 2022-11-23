from datetime import datetime

import pytest
from boxtribute_server.enums import DistributionEventState
from boxtribute_server.models.definitions.distribution_event import DistributionEvent

from .location import another_distribution_spot_data, distribution_spot_data


def default_distribution_event_data():
    return {
        "id": 1,
        "name": "Distribution Test Event 1",
        "planned_start_date_time": datetime(2023, 5, 5, 10, 00),
        "planned_end_date_time": datetime(2023, 5, 5, 11, 00),
        "distribution_spot": distribution_spot_data()["id"],
        "state": DistributionEventState.Planning,
    }


def another_distribution_event_data():
    return {
        "id": 2,
        "name": "Distribution Test Event 2",
        "planned_start_date_time": datetime(2023, 5, 5, 10, 00),
        "planned_end_date_time": datetime(2023, 5, 5, 11, 00),
        "distribution_spot": another_distribution_spot_data()["id"],
        "state": DistributionEventState.Planning,
    }


@pytest.fixture()
def default_distribution_event():
    return default_distribution_event_data()


def create():
    DistributionEvent.insert_many(
        [default_distribution_event_data(), another_distribution_event_data()]
    ).execute()
