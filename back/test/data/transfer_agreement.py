import pytest
from boxtribute_server.enums import TransferAgreementState, TransferAgreementType
from boxtribute_server.models.definitions.transfer_agreement import TransferAgreement
from boxtribute_server.models.utils import utcnow

from .organisation import data as organisation_data
from .user import default_user_data

TIME = utcnow().replace(tzinfo=None)


def data():
    return {
        "id": 1,
        "source_organisation": organisation_data()[0]["id"],
        "target_organisation": organisation_data()[1]["id"],
        "state": TransferAgreementState.Accepted.value,
        "type": TransferAgreementType.Bidirectional.value,
        "requested_by": default_user_data()["id"],
        "requested_on": TIME,
        "valid_from": TIME,
        "comment": "looks good to me",
    }


def expired_transfer_agreement_data():
    agreement = data()
    agreement["id"] = 2
    agreement["state"] = TransferAgreementState.Expired.value
    return agreement


@pytest.fixture
def default_transfer_agreement():
    return data()


@pytest.fixture
def expired_transfer_agreement():
    return expired_transfer_agreement_data()


def create():
    TransferAgreement.create(**data())
    TransferAgreement.create(**expired_transfer_agreement_data())
