import pytest
from boxtribute_server.enums import TransferAgreementState, TransferAgreementType
from boxtribute_server.models.definitions.transfer_agreement import TransferAgreement
from boxtribute_server.models.utils import utcnow

from .organisation import data as organisation_data
from .user import default_user_data

TIME = utcnow().replace(tzinfo=None)


def data():
    return [
        {
            "id": 1,
            "source_organisation": organisation_data()[0]["id"],
            "target_organisation": organisation_data()[1]["id"],
            "state": TransferAgreementState.Accepted.value,
            "type": TransferAgreementType.Bidirectional.value,
            "requested_by": default_user_data()["id"],
            "requested_on": TIME,
            "valid_from": TIME,
            "comment": "looks good to me",
        },
        {
            "id": 2,
            "source_organisation": organisation_data()[0]["id"],
            "target_organisation": organisation_data()[1]["id"],
            "state": TransferAgreementState.Expired.value,
            "type": TransferAgreementType.Bidirectional.value,
            "requested_by": default_user_data()["id"],
        },
    ]


@pytest.fixture
def default_transfer_agreement():
    return data()[0]


@pytest.fixture
def expired_transfer_agreement():
    return data()[1]


@pytest.fixture
def transfer_agreements():
    return data()


def create():
    TransferAgreement.insert_many(data()).execute()
