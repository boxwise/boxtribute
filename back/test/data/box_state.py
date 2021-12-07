import pytest
from boxtribute_server.models.box_state import BoxState
from boxtribute_server.models.enums import BoxState as BoxStateEnum


def data():
    return [{"id": s.value, "label": s.name} for s in BoxStateEnum]


def default_box_state_data():
    return data()[0]


@pytest.fixture()
def default_box_state():
    return default_box_state_data()


def create():
    BoxState.insert_many(data()).execute()
