from datetime import datetime

import pytest
from boxtribute_server.models.definitions.history import DbChangeHistory

from .box import another_marked_for_shipment_box_data
from .box import data as box_data


def data():
    return [
        {
            # corresponding box was added to a shipment
            "id": 1,
            "changes": "box_state_id",
            "from_int": 1,
            "to_int": 3,
            "record_id": another_marked_for_shipment_box_data()["id"],
            "change_date": datetime(2023, 6, 21),
            "table_name": "stock",
        },
        {"id": 112, "changes": "Changes"},
    ] + [
        {
            "id": i,
            "changes": "Record created",
            "record_id": box["id"],
            "change_date": box["created_on"],
            "table_name": "stock",
        }
        for i, box in enumerate(box_data(), start=2)
    ]


@pytest.fixture
def default_history():
    return data()[1]


def create():
    DbChangeHistory.insert_many(data()).execute()
