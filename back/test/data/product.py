import pytest
from boxtribute_server.models.definitions.product import Product
from data.base import data as base_data
from data.product_category import default_product_category_data
from data.product_gender import default_product_gender_data
from data.size_range import default_size_range_data
from data.user import default_user_data


def default_product_data():
    return {
        "id": 1,
        "base": base_data()[0]["id"],
        "category": default_product_category_data()["id"],
        "gender": default_product_gender_data()["id"],
        "name": "indigestion tablets",
        "size_range": default_size_range_data()["id"],
        "in_shop": 0,
        "price": 1,
        "created_by": default_user_data()["id"],
    }


@pytest.fixture()
def default_product():
    return default_product_data()


def create():
    Product.create(**default_product_data())
