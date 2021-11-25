import pytest
from boxtribute_server.models.size_range import SizeRange


def default_size_range_data():
    mock_size_range = {"id": 1, "label": "the label", "seq": 1}
    return mock_size_range


@pytest.fixture()
def default_size_range():
    return default_size_range_data()


def create_default_size_range():
    SizeRange.create(**default_size_range_data())
