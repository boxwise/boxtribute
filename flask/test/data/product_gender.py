import pytest
from boxwise_flask.models.product_gender import ProductGender


def default_product_gender_data():
    mock_product_gender = {
        "id": 1,
        "adult": 1,
        "baby": 2,
        "child": 3,
        "color": "red",
        "female": 1,
        "label": "1",
        "male": 1,
        "created": None,
        "created_by": None,
        "modified": None,
        "modified_by": None,
        "seq": None,
        "shortlabel": None,
    }

    return mock_product_gender


@pytest.fixture()
def default_product_gender():
    return default_product_gender_data()


def create_default_product_gender():
    ProductGender.create(**default_product_gender_data())
