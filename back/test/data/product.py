import pytest
from boxtribute_server.models.definitions.product import Product

from .base import data as base_data
from .product_category import default_product_category_data
from .product_gender import default_product_gender_data
from .size_range import data as size_range_data
from .user import default_user_data


def data():
    # Alter ID, base, name if needed
    return [
        {
            "id": 1,
            "base": base_data()[0]["id"],
            "name": "indigestion tablets",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()["id"],
            "in_shop": 0,
            "price": 1,
            "created_by": default_user_data()["id"],
        },
        {
            "id": 2,
            "base": base_data()[2]["id"],
            "name": "new product",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()["id"],
            "in_shop": 0,
            "price": 1,
            "created_by": default_user_data()["id"],
        },
        {
            "id": 3,
            "base": base_data()[0]["id"],
            "name": "jackets",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()["id"],
            "in_shop": 0,
            "price": 1,
            "created_by": default_user_data()["id"],
        },
    ]


@pytest.fixture
def default_product():
    return data()[0]


@pytest.fixture
def another_product():
    return data()[1]


@pytest.fixture
def products():
    return data()


@pytest.fixture
def base1_products():
    all_products = data()
    return [all_products[0], all_products[2]]


def create():
    Product.insert_many(data()).execute()
