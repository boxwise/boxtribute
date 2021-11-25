from datetime import datetime

import pytest
from boxtribute_server.models.product import Product
from data.base import default_base_data
from data.product_category import default_product_category_data
from data.product_gender import default_product_gender_data
from data.size_range import default_size_range_data

TIME = datetime.now()


def default_product_data():
    mock_product = {
        "id": 1,
        "base": default_base_data()["id"],
        "category": default_product_category_data()["id"],
        "gender": default_product_gender_data()["id"],
        "name": "indigestion tablets",
        "size_range": default_size_range_data()["id"],
        "in_shop": 0,
        "price": 1,
    }
    return mock_product


@pytest.fixture()
def default_product():
    return default_product_data()


def create_default_product():
    Product.create(**default_product_data())
