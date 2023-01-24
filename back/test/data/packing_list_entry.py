import pytest
from boxtribute_server.enums import PackingListEntryState
from boxtribute_server.models.definitions.packing_list_entry import PackingListEntry

from .distribution_event import (
    another_distribution_event_data,
    default_distribution_event_data,
)
from .product import data as product_data
from .size import default_data as default_size_data


def data():
    return [
        {
            "id": 1,
            "product": product_data()[1]["id"],
            "number_of_items": 1,
            "size": default_size_data()["id"],
            "distribution_event": another_distribution_event_data()["id"],
            "state": PackingListEntryState.NotStarted,
        },
        {
            "id": 2,
            "product": product_data()[0]["id"],
            "number_of_items": 1,
            "size": default_size_data()["id"],
            "distribution_event": default_distribution_event_data()["id"],
            "state": PackingListEntryState.NotStarted,
        },
    ]


@pytest.fixture
def packing_list_entry():
    return data()[1]


def create():
    PackingListEntry.insert_many(data()).execute()
