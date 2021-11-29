import pytest
from boxtribute_server.models.transfer_agreement import TransferAgreement

from .organisation import data as organisation_data


def data():
    return {
        "id": 1,
        "source_organisation": organisation_data()[0]["id"],
        "target_organisation": organisation_data()[1]["id"],
    }


@pytest.fixture
def default_transfer_agreement():
    return data()


def create():
    TransferAgreement.create(**data())
