import pytest
from boxwise_flask.models.qr_code import QRCode


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

def create_default_qr_code():
    QRCode.create(**default_qr_code_data())

def create_qr_code_without_box():
    QRCode.create(**qr_code_without_box_data())
