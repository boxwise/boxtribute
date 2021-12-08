import pytest
from boxtribute_server.models import utcnow
from boxtribute_server.models.beneficiary import Beneficiary
from data.base import data as base_data

TIME = utcnow()


def default_beneficiary_data():
    return {
        "id": 3,
        "base": base_data()[0]["id"],
        "comments": "",
        "created_on": TIME,
        "created_by": None,
        "deleted": TIME,
        "family_id": 10,
        "seq": 3,
        # must not be empty acc. to Model definition
        "bicycle_ban_comment": "",
        "workshop_ban_comment": "",
    }


def another_beneficiary_data():
    data = default_beneficiary_data().copy()
    data["id"] = 4
    return data


@pytest.fixture()
def default_beneficiary():
    return default_beneficiary_data()


def create():
    Beneficiary.create(**default_beneficiary_data())
    Beneficiary.create(**another_beneficiary_data())
