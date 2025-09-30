from datetime import date, datetime

import pytest
from boxtribute_server.enums import HumanGender
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
        "family_head": None,
        "seq": 1,
        "group_identifier": "1234",
        "comment": "comment for fun",
        "gender": HumanGender.Male,
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
        "deleted_on": datetime(2021, 12, 31),  # == not active
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
        "gender": HumanGender.Female,
    }


def org2_base3_beneficiary_data():
    return {
        "id": 4,
        "first_name": "No",
        "last_name": "One",
        "base": base_data()[2]["id"],
        "created_on": datetime(2022, 1, 20),
        "created_by": None,
        "family_id": 12,
        "seq": 1,
        "group_identifier": "999",
        "gender": HumanGender.Female,
    }


def another_relative_beneficiary_data():
    # Beneficiary in the same family as #1
    return {
        "id": 5,
        "first_name": "Some",
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
    }


def another_male_beneficiary_data():
    return {
        "id": 6,
        "first_name": "Any",
        "last_name": "Body",
        "base": base_data()[0]["id"],
        "date_of_birth": date(1995, 5, 5),
        "created_on": datetime(2019, 6, 30),
        "created_by": None,
        "family_id": 10,
        "family_head": None,
        "seq": 1,
        "group_identifier": "123",
        "gender": HumanGender.Male,
    }


@pytest.fixture
def default_beneficiaries():
    return [
        default_beneficiary_data(),
        relative_beneficiary_data(),
        another_beneficiary_data(),
        another_relative_beneficiary_data(),
        another_male_beneficiary_data(),
    ]


@pytest.fixture
def default_beneficiary():
    return default_beneficiary_data()


@pytest.fixture
def relative_beneficiary():
    return relative_beneficiary_data()


@pytest.fixture
def another_relative_beneficiary():
    return another_relative_beneficiary_data()


@pytest.fixture
def another_beneficiary():
    return another_beneficiary_data()


@pytest.fixture
def another_male_beneficiary():
    return another_male_beneficiary_data()


def create():
    # not using insert_many() because relative_beneficiary's gender not defined
    Beneficiary.create(**default_beneficiary_data())
    Beneficiary.create(**relative_beneficiary_data())
    Beneficiary.create(**another_beneficiary_data())
    Beneficiary.create(**org2_base3_beneficiary_data())
    Beneficiary.create(**another_relative_beneficiary_data())
    Beneficiary.create(**another_male_beneficiary_data())
    # Beneficiary.create(**recent_beneficiary_data())
