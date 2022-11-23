import pytest
from boxtribute_server.models.definitions.qr_code import QrCode


def default_qr_code_data():
    return {"id": 1, "code": "999"}


def qr_code_without_box_data():
    return {"id": 2, "code": "555"}


def another_qr_code_with_box_data():
    return {"id": 3, "code": "111"}


@pytest.fixture
def default_qr_code():
    return default_qr_code_data()


@pytest.fixture
def qr_code_without_box():
    return qr_code_without_box_data()


@pytest.fixture
def another_qr_code_with_box():
    return another_qr_code_with_box_data()


def create():
    QrCode.insert_many(
        [
            default_qr_code_data(),
            qr_code_without_box_data(),
            another_qr_code_with_box_data(),
        ]
    ).execute()
