import pytest
from boxtribute_server.models.definitions.transaction import Transaction
from boxtribute_server.models.utils import utcnow
from data.beneficiary import another_beneficiary_data, default_beneficiary_data
from data.product import data as product_data
from data.user import default_user_data

TIME = utcnow().replace(year=2021, tzinfo=None)


def default_transaction_data():
    return {
        "id": 1,
        "beneficiary": default_beneficiary_data()["id"],
        "count": 2,
        "tokens": 99,
        "description": "a transaction",
        "product": product_data()[0]["id"],
        "created_by": default_user_data()["id"],
        "created_on": TIME,
    }


def relative_transaction_data():
    # Transaction performed by arbitrary family member but tracked by family head
    data = default_transaction_data()
    data["id"] = 2
    data["created_on"] = TIME.replace(year=2020)
    return data


def another_transaction_data():
    data = default_transaction_data()
    data["id"] = 3
    data["beneficiary"] = another_beneficiary_data()["id"]
    data["created_on"] = TIME.replace(year=2020)
    return data


@pytest.fixture
def default_transaction():
    return default_transaction_data()


@pytest.fixture
def relative_transaction():
    return relative_transaction_data()


def create():
    Transaction.create(**default_transaction_data())
    Transaction.create(**relative_transaction_data())
    Transaction.create(**another_transaction_data())
