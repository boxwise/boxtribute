from datetime import datetime

import pytest
from boxtribute_server.enums import BoxState
from boxtribute_server.models.definitions.history import DbChangeHistory

from .box import another_marked_for_shipment_box_data
from .box import data as box_data
from .box import donated_boxes_data


def data():
    return (
        [
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
        ]
        + [
            {
                "id": i,
                "changes": "Record created",
                "record_id": box["id"],
                "change_date": box["created_on"],
                "table_name": "stock",
            }
            for i, box in enumerate(box_data(), start=2)
        ]
        + [
            {
                "id": i,
                "changes": "box_state_id",
                "record_id": box["id"],
                "change_date": "2022-12-05",
                "table_name": "stock",
                "from_int": BoxState.InStock,
                "to_int": BoxState.Donated,
            }
            for i, box in enumerate(donated_boxes_data(), start=3 + len(box_data()))
        ]
    )


@pytest.fixture
def default_history():
    return data()[1]


def create():
    DbChangeHistory.insert_many(data()).execute()
