import pytest
from boxwise_flask.models.qr_code import QRCode


def default_qr_code_data():
    mock_qr_code = {"id": 1, "code": "999"}
    return mock_qr_code


@pytest.fixture()
def default_qr_code():
    return default_qr_code_data()


def create_default_qr_code():
    QRCode.create(**default_qr_code_data())
