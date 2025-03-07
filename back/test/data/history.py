from datetime import datetime

import pytest
from boxtribute_server.enums import BoxState
from boxtribute_server.models.definitions.history import DbChangeHistory
from boxtribute_server.models.utils import HISTORY_CREATION_MESSAGE

from .box import another_marked_for_shipment_box_data
from .box import data as box_data
from .box import donated_boxes_data, lost_box_data
from .user import default_user_data

USER_ID = default_user_data()["id"]


def data():
    return (
        [
            {
                "id": i,
                "changes": HISTORY_CREATION_MESSAGE,
                "record_id": box["id"],
                "change_date": box["created_on"],
                "table_name": "stock",
                "user": USER_ID,
                "from_int": None,
                "to_int": None,
            }
            for i, box in enumerate(box_data(), start=1)
        ]
        + [
            {
                "id": i,
                "changes": "box_state_id",
                "record_id": box["id"],
                "change_date": "2022-12-05",
                "table_name": "stock",
                "user": USER_ID,
                "from_int": BoxState.InStock,
                "to_int": BoxState.Donated,
            }
            for i, box in enumerate(donated_boxes_data(), start=1 + len(box_data()))
        ]
        + [
            {
                # corresponding box was added to a shipment
                "id": 110,
                "changes": "box_state_id",
                "from_int": 1,
                "to_int": 3,
                "record_id": another_marked_for_shipment_box_data()["id"],
                "change_date": datetime(2023, 6, 21),
                "table_name": "stock",
                "user": USER_ID,
            },
            {
                "id": 111,
                "changes": "box_state_id",
                "from_int": BoxState.InStock,
                "to_int": BoxState.Lost,
                "record_id": lost_box_data()["id"],
                "change_date": datetime(2023, 2, 1),
                "table_name": "stock",
                "user": USER_ID,
            },
        ]
    )


@pytest.fixture
def default_history():
    return data()[1]


def create():
    DbChangeHistory.insert_many(data()).execute()
