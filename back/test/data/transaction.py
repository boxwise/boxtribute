from datetime import datetime

import pytest
from boxtribute_server.models.definitions.transaction import Transaction

from .beneficiary import another_beneficiary_data, default_beneficiary_data
from .product import data as product_data
from .user import default_user_data

TIME = datetime(2021, 1, 15)


def data():
    return [
        {
            "id": 1,
            "beneficiary": default_beneficiary_data()["id"],
            "count": 2,
            "tokens": 99,
            "description": "a transaction",
            "product": product_data()[0]["id"],
            "created_by": default_user_data()["id"],
            "created_on": TIME,
        },
        # Transaction performed by arbitrary family member but tracked by family head
        {
            "id": 2,
            "beneficiary": default_beneficiary_data()["id"],
            "count": 3,
            "tokens": 50,
            "description": "a transaction",
            "product": product_data()[0]["id"],
            "created_by": default_user_data()["id"],
            "created_on": TIME.replace(year=2020),
        },
        {
            "id": 3,
            "beneficiary": another_beneficiary_data()["id"],
            "count": 6,
            "tokens": 20,
            "description": "a transaction",
            "product": product_data()[0]["id"],
            "created_by": default_user_data()["id"],
            "created_on": TIME.replace(year=2020),
        },
        {
            "id": 4,
            "beneficiary": another_beneficiary_data()["id"],
            "count": 5,
            "tokens": 10,
            "description": "a transaction",
            "product": product_data()[2]["id"],
            "created_by": default_user_data()["id"],
            "created_on": TIME.replace(year=2019),
        },
    ]


@pytest.fixture
def default_transaction():
    return data()[0]


@pytest.fixture
def relative_transaction():
    return data()[1]


@pytest.fixture
def another_transaction():
    return data()[3]


def create():
    Transaction.insert_many(data()).execute()
