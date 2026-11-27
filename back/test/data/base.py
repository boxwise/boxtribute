from datetime import datetime

import pytest
from boxtribute_server.models.definitions.base import Base

from .organisation import data as organisation_data


def data():
    return [
        {
            "id": 1,
            "name": "the best name",
            "freeshop_currency_name": "dingo dollars",
            "monetary_currency_code": "EUR",
            "seq": 1,
            "organisation": organisation_data()[0]["id"],
            "deleted_on": None,
            "group_identifier": "Refugee ID",
            "adult_age": 16,
            "days_to_keep_inactive_beneficiaries": 60,
            "credit_per_adult": 100,
            "credit_per_child": 50,
            "tracking_registered_beneficiaries_enabled": True,
            "beneficiaries_as_volunteers_enabled": False,
            "beneficiary_email_enabled": True,
            "beneficiary_phone_enabled": False,
            "beneficiary_custom_text_field_1_enabled": True,
            "beneficiary_custom_text_field_2_enabled": False,
            "beneficiary_custom_number_field_enabled": True,
            "beneficiary_custom_date_field_enabled": False,
            "beneficiary_custom_text_field_1_name": "Nationality",
            "beneficiary_custom_text_field_2_name": "Clothing size",
            "beneficiary_custom_number_field_name": "Number of children",
            "beneficiary_custom_date_field_name": None,
        },
        {
            "id": 2,
            "name": "Aßlar",
            "freeshop_currency_name": "monster munch",
            "monetary_currency_code": "USD",
            "seq": 1,
            "organisation": organisation_data()[0]["id"],
            "deleted_on": None,
        },
        {
            "id": 3,
            "name": "Würzburg",
            "freeshop_currency_name": "mustard",
            "monetary_currency_code": "EUR",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
            "deleted_on": None,
        },
        {
            "id": 4,
            "name": "second base",
            "freeshop_currency_name": "pounds",
            "monetary_currency_code": "GBP",
            "seq": 1,
            "organisation": organisation_data()[1]["id"],
            "deleted_on": None,
        },
        {
            "id": 5,
            "name": "third base",
            "freeshop_currency_name": "euro",
            "monetary_currency_code": "EUR",
            "seq": 1,
            "organisation": organisation_data()[2]["id"],
            "deleted_on": datetime(2023, 1, 1),
        },
    ]


@pytest.fixture
def default_base():
    return data()[0]


@pytest.fixture
def another_base():
    return data()[2]


@pytest.fixture
def deleted_base():
    return data()[4]


@pytest.fixture
def default_bases():
    return data()


def create():
    Base.insert_many(data()).execute()
