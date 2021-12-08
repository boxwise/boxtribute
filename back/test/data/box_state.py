import pytest
from boxtribute_server.models.box_state import BoxState


def default_box_state_data():
    mock_box_state = {"id": 1, "label": "1"}
    return mock_box_state


@pytest.fixture()
def default_box_state():
    return default_box_state_data()


def create():
    BoxState.create(**default_box_state_data())
