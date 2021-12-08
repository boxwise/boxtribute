import pytest
from boxtribute_server.models.definitions.beneficiary import Beneficiary
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_base")
@pytest.mark.usefixtures("default_beneficiary")
def test_beneficiary_model(default_base, default_beneficiary):
    queried_beneficiary = Beneficiary.get_by_id(default_beneficiary["id"])

    queried_beneficiary_dict = model_to_dict(queried_beneficiary)

    assert queried_beneficiary_dict["id"] == default_beneficiary["id"]
    assert queried_beneficiary_dict["comments"] == default_beneficiary["comments"]
    assert queried_beneficiary_dict["created_on"] == default_beneficiary[
        "created_on"
    ].replace(tzinfo=None)
    assert queried_beneficiary_dict["created_by"] == default_beneficiary["created_by"]
    assert queried_beneficiary_dict["deleted"] == default_beneficiary[
        "deleted"
    ].replace(tzinfo=None)
    assert queried_beneficiary_dict["family_id"] == default_beneficiary["family_id"]
    assert queried_beneficiary_dict["seq"] == default_beneficiary["seq"]
    assert queried_beneficiary_dict["base"]["id"] == default_base["id"]
