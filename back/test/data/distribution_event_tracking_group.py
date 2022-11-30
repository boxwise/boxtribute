import pytest
from boxtribute_server.enums import DistributionEventsTrackingGroupState
from boxtribute_server.models.definitions.distribution_events_tracking_group import (
    DistributionEventsTrackingGroup,
)
from boxtribute_server.models.utils import utcnow

from .base import data as base_data

TIME = utcnow().replace(tzinfo=None)


def default_tracking_group_data():
    return {
        "id": 1,
        "state": DistributionEventsTrackingGroupState.InProgress,
        "created_on": TIME,
        "base": base_data()[0]["id"],
    }


@pytest.fixture
def default_tracking_group():
    return default_tracking_group_data()


def create():
    DistributionEventsTrackingGroup.insert_many(
        [
            default_tracking_group_data(),
        ]
    ).execute()
