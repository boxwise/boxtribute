import pytest
from boxtribute_server.models.product_category import ProductCategory


def default_product_category_data():
    mock_product_category = {"id": 1, "name": "1", "seq": 1, "parent": None}

    return mock_product_category


@pytest.fixture()
def default_product_category():
    return default_product_category_data()


def create_default_product_category():
    ProductCategory.create(**default_product_category_data())
