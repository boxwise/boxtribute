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


def packing_distro_event_data():
    data = default_distribution_event_data()
    data["id"] = 3
    data["state"] = DistributionEventState.Packing
    return data


def on_distro_distribution_event_data():
    data = default_distribution_event_data()
    data["id"] = 4
    data["state"] = DistributionEventState.OnDistro
    return data


def returned_distribution_event_data():
    data = default_distribution_event_data()
    data["id"] = 5
    data["state"] = DistributionEventState.ReturnedFromDistribution
    return data


def completed_distribution_event_data():
    data = default_distribution_event_data()
    data["id"] = 6
    data["state"] = DistributionEventState.Completed
    return data


@pytest.fixture
def default_distribution_event():
    return default_distribution_event_data()


@pytest.fixture
def distro_spot5_distribution_events():
    return [
        default_distribution_event_data(),
        packing_distro_event_data(),
        on_distro_distribution_event_data(),
        returned_distribution_event_data(),
        completed_distribution_event_data(),
    ]


@pytest.fixture
def distro_spot5_distribution_events_before_return_state():
    return [
        default_distribution_event_data(),
        packing_distro_event_data(),
        on_distro_distribution_event_data(),
    ]


@pytest.fixture
def distro_spot5_distribution_events_in_return_state():
    return [returned_distribution_event_data()]


def create():
    DistributionEvent.insert_many(
        [
            default_distribution_event_data(),
            another_distribution_event_data(),
            packing_distro_event_data(),
            on_distro_distribution_event_data(),
            returned_distribution_event_data(),
            completed_distribution_event_data(),
        ]
    ).execute()
