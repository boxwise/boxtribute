import pytest
from boxwise_flask.models.box_state import BoxState


@pytest.fixture()
def default_box_state():
    mock_box_state = {"id": 1, "label": 1}
    BoxState.create(**mock_box_state)
    return mock_box_state
