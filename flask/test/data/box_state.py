import pytest
from boxwise_flask.models.box_state import BoxState


def default_box_state_data():
    mock_box_state = {"id": 1, "label": "1"}
    return mock_box_state


@pytest.fixture()
def default_box_state():
    return default_box_state_data()


def create_default_box_state():
    BoxState.create(**default_box_state_data())
