import pytest
from boxtribute_server.models.qr_code import QrCode


def default_qr_code_data():
    mock_qr_code = {"id": 1, "code": "999"}
    return mock_qr_code


def qr_code_without_box_data():
    mock_qr_code = {"id": 2, "code": "555"}
    return mock_qr_code


@pytest.fixture()
def default_qr_code():
    return default_qr_code_data()


@pytest.fixture()
def qr_code_without_box():
    return qr_code_without_box_data()


def create():
    QrCode.create(**default_qr_code_data())
    QrCode.create(**qr_code_without_box_data())
