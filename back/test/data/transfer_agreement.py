from datetime import datetime

import pytest
from boxtribute_server.models.enums import TransferAgreementState, TransferAgreementType
from boxtribute_server.models.transfer_agreement import TransferAgreement

from .organisation import data as organisation_data
from .user import default_user_data


def data():
    return {
        "id": 1,
        "source_organisation": organisation_data()[0]["id"],
        "target_organisation": organisation_data()[1]["id"],
        "state": TransferAgreementState.ACCEPTED.value,
        "type": TransferAgreementType.BIDIRECTIONAL.value,
        "requested_on": datetime.utcnow(),
        "requested_by": default_user_data()["id"],
    }


@pytest.fixture
def default_transfer_agreement():
    return data()


def create():
    TransferAgreement.create(**data())
