import pytest
from boxwise_flask.models.location import Location


@pytest.fixture()
def default_location(default_box_state, default_base):
    mock_location = {
        "id": 1,
        "box_state": default_box_state["id"],
        "base": default_base["id"],
        "container_stock": 0,
        "deleted": None,
        "is_donated": 0,
        "is_lost": 0,
        "is_market": 0,
        "is_scrap": 0,
        "label": 1,
        "seq": 1,
        "visible": 1,
    }

    Location.create(**mock_location)
    return mock_location
