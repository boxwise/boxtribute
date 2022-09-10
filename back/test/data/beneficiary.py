from datetime import date, datetime

import pytest
from boxtribute_server.models.definitions.beneficiary import Beneficiary

from .base import data as base_data


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


def relative_beneficiary_data():
    # Beneficiary in the same family as #1
    return {
        "id": 2,
        "first_name": "No",
        "last_name": "Body",
        "base": base_data()[0]["id"],
        "created_on": datetime(2021, 6, 30),
        "created_by": None,
        "family_id": 10,
        "family_head": 1,
        "seq": 2,
        "group_identifier": "1234",
        "is_volunteer": True,
        "not_registered": True,
        "deleted": datetime(2021, 12, 31),  # == not active
    }


def another_beneficiary_data():
    return {
        "id": 3,
        "first_name": "No",
        "last_name": "One",
        "base": base_data()[0]["id"],
        "created_on": datetime(2022, 1, 30),
        "created_by": None,
        "family_id": 11,
        "seq": 1,
        "group_identifier": "5678",
        "gender": "F",
    }


def org2_base3_beneficiary_data():
    return {
        "id": 4,
        "first_name": "No",
        "last_name": "One",
        "base": base_data()[2]["id"],
        "created_on": datetime(2022, 1, 30),
        "created_by": None,
        "family_id": 12,
        "seq": 1,
        "group_identifier": "999",
        "gender": "F",
    }


@pytest.fixture
def default_beneficiaries():
    return [
        default_beneficiary_data(),
        relative_beneficiary_data(),
        another_beneficiary_data(),
    ]


@pytest.fixture
def default_beneficiary():
    return default_beneficiary_data()


@pytest.fixture
def relative_beneficiary():
    return relative_beneficiary_data()


def create():
    # not using insert_many() because relative_beneficiary's gender not defined
    Beneficiary.create(**default_beneficiary_data())
    Beneficiary.create(**relative_beneficiary_data())
    Beneficiary.create(**another_beneficiary_data())
    Beneficiary.create(**org2_base3_beneficiary_data())
