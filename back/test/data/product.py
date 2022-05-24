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


def another_product_data():
    data = default_product_data()
    data["id"] = 2
    data["base"] = base_data()[2]["id"]
    data["name"] = "new product"
    return data


def data():
    return [default_product_data(), another_product_data()]


@pytest.fixture
def default_product():
    return default_product_data()


@pytest.fixture
def another_product():
    return another_product_data()


@pytest.fixture
def products():
    return data()


def create():
    Product.insert_many(data()).execute()
