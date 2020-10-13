from datetime import datetime

import pytest
from boxwise_flask.models.box import Box


@pytest.fixture()
def default_box(default_box_state, default_location):
    mock_box = {
        "id": 2,
        "box_id": "abc",
        "box_state": default_box_state["id"],
        "comments": "",
        "created": datetime.now(),
        "created_by": None,
        "deleted": datetime.now(),
        "items": "None",
        "location": default_location["id"],
    }
    Box.create(**mock_box)
    return mock_box
