import pytest
from boxwise_flask.models.qr_code import QRCode


@pytest.fixture()
def default_qr_code():
    mock_qr_code = {"id": 1, "code": "999"}
    QRCode.create(**mock_qr_code)
    return mock_qr_code
