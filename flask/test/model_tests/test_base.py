import pytest
from boxwise_flask.models.base import Base
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_base")
def test_box_model(default_base):
    base = Base.get_from_id(default_base["id"])
    base_dict = model_to_dict(base)
    assert base_dict["id"] == default_base["id"]
    assert base_dict["seq"] == default_base["seq"]
    assert base_dict["organisation"]["id"] == default_base["organisation_id"]
