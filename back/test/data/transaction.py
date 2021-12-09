import pytest
from boxtribute_server.models.definitions.transaction import Transaction
from data.beneficiary import default_beneficiary_data
from data.product import default_product_data
from data.user import default_user_data


def default_transaction_data():
    return {
        "id": 4,
        "beneficiary": default_beneficiary_data()["id"],
        "count": 99,
        "description": "a transaction",
        "product": default_product_data()["id"],
        "user": default_user_data()["id"],
    }


@pytest.fixture()
def default_transaction():
    return default_transaction_data()


def create():
    Transaction.create(**default_transaction_data())
