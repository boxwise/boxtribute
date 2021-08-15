import pytest
from boxwise_flask.models.box import Box
from playhouse.shortcuts import model_to_dict


@pytest.mark.usefixtures("default_box")
@pytest.mark.usefixtures("default_product")
@pytest.mark.usefixtures("default_product_gender")
@pytest.mark.usefixtures("default_product_category")
def test_box_model(
    efaultx, default_product, default_product_gender, default_product_category
):

    queried_box = Box.get_box(default_box["box_id"])

    queried_box_dict = model_to_dict(queried_box)
    if queried_box_dict != default_box:
        print("queried_box ", queried_box_dict)
        print("created_box ", default_box)

    assert queried_box_dict["id"] == default_box["id"]
    assert queried_box_dict["box_id"] == default_box["box_id"]
    assert queried_box_dict["box_state"]["id"] == default_box["box_state"]
    assert queried_box_dict["comments"] == default_box["comments"]
    assert queried_box_dict["created"] == default_box["created"]
    assert queried_box_dict["created_by"] == default_box["created_by"]
    assert queried_box_dict["deleted"] == default_box["deleted"]
    assert queried_box_dict["items"] == default_box["items"]
    assert queried_box_dict["location"]["id"] == default_box["location"]
    assert queried_box_dict["product"]["id"] == default_product["id"]
    assert queried_box_dict["product"]["product_gender"] == default_product_gender
    assert queried_box_dict["product"]["product_category"] == default_product_category
