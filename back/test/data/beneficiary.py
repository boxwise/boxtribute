from datetime import date, datetime

import pytest
from boxtribute_server.models.definitions.beneficiary import Beneficiary
from data.base import data as base_data


def default_beneficiary_data():
    return {
        "id": 1,
        "first_name": "Every",
        "last_name": "Body",
        "base": base_data()[0]["id"],
        "date_of_birth": date(1995, 5, 5),
        "created_on": datetime(2020, 6, 30),
        "created_by": None,
        "family_id": 10,
        "seq": 1,
        "group_identifier": "1234",
        "comment": "comment for fun",
        "gender": "M",
    }


def another_beneficiary_data():
    return {
        "id": 2,
        "first_name": "No",
        "last_name": "Body",
        "base": base_data()[0]["id"],
        "date_of_birth": date(2000, 1, 1),
        "created_on": datetime(2021, 6, 30),
        "created_by": None,
        "family_id": 10,
        "family_head": 1,
        "seq": 2,
        "group_identifier": "1234",
        "gender": "F",
        "is_volunteer": True,
        "not_registered": True,
        "deleted": datetime(2021, 12, 31),
    }


@pytest.fixture()
def default_beneficiary():
    return default_beneficiary_data()


def create():
    Beneficiary.create(**default_beneficiary_data())
    Beneficiary.create(**another_beneficiary_data())
