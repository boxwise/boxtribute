import pytest
from boxtribute_server.models.box_state import BoxState


def data():
    return [
        {"id": 1, "label": "Instock"},
        {"id": 2, "label": "Lost"},
        {"id": 3, "label": "Ordered"},
        {"id": 4, "label": "Picked"},
        {"id": 5, "label": "Donated"},
        {"id": 6, "label": "Scrap"},
    ]


def default_box_state_data():
    return data()[0]


@pytest.fixture()
def default_box_state():
    return default_box_state_data()


def create():
    BoxState.insert_many(data()).execute()
