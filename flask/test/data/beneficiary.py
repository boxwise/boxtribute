from datetime import datetime

import pytest
from boxwise_flask.models.beneficiary import Beneficiary
from data.base import default_base_data

TIME = datetime.now()


def default_beneficiary_data():
    return {
        "id": 3,
        "base": default_base_data()["id"],
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


def create_default_beneficiary():
    Beneficiary.create(**default_beneficiary_data())
    Beneficiary.create(**another_beneficiary_data())
