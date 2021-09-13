import pytest
from boxwise_flask.models.transaction import Transaction
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_transaction")
@pytest.mark.usefixtures("default_beneficiary")
@pytest.mark.usefixtures("default_product")
@pytest.mark.usefixtures("default_user")
def test_beneficiary_model(
    default_transaction, default_beneficiary, default_product, default_user
):
    query = Transaction.get_by_id(default_transaction["id"])

    query_dict = model_to_dict(query)

    assert query_dict["id"] == default_transaction["id"]
    assert query_dict["beneficiary"]["id"] == default_beneficiary["id"]
    assert query_dict["count"] == default_transaction["count"]
    assert query_dict["description"] == default_transaction["description"]
    assert query_dict["product"]["id"] == default_product["id"]
    assert query_dict["user"]["id"] == default_user["id"]
