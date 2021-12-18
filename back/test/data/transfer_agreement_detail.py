import pytest
from boxtribute_server.models.definitions.transfer_agreement_detail import (
    TransferAgreementDetail,
)

from .base import data as base_data
from .transfer_agreement import data as transfer_agreement_data


def data():
    return [
        {
            "id": 1,
            "transfer_agreement": transfer_agreement_data()[0]["id"],
            "source_base": None,
            "target_base": base_data()[2]["id"],
        }
    ]


@pytest.fixture
def default_transfer_agreement_detail():
    return data()[0]


def create():
    TransferAgreementDetail.insert_many(data()).execute()
