from boxtribute_server.enums import PackingListEntryState
from boxtribute_server.models.definitions.packing_list_entry import PackingListEntry

from .distribution_event import another_distribution_event_data
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
    ]


def create():
    PackingListEntry.insert_many(data()).execute()
