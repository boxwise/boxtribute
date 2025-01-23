from datetime import datetime

import pytest
from boxtribute_server.models.definitions.product import Product

from .base import data as base_data
from .product_category import data as all_product_category_data
from .product_category import default_product_category_data
from .product_gender import data as all_product_gender_data
from .product_gender import default_product_gender_data
from .size_range import data as size_range_data
from .size_range import mass_dimension_data, volume_dimension_data
from .standard_product import data as all_standard_product_data
from .user import default_user_data


def data():
    # Alter ID, base, name if needed
    return [
        {
            "id": 1,
            "base": base_data()[0]["id"],
            "name": "Indigestion tablets",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()[0]["id"],
            "in_shop": 0,
            "price": 1,
            "comment": "awesome stuff",
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": None,
        },
        {
            "id": 2,
            "base": base_data()[2]["id"],
            "name": "new product",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()[0]["id"],
            "in_shop": 0,
            "price": 1,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": None,
        },
        {
            "id": 3,
            "base": base_data()[0]["id"],
            "name": " jackets ",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()[0]["id"],
            "in_shop": 0,
            "price": 1,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": None,
        },
        {
            "id": 4,
            "base": base_data()[0]["id"],
            "name": "deleted product",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": size_range_data()[0]["id"],
            "in_shop": 0,
            "price": 1,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": datetime(2022, 1, 1),
            "standard_product": None,
        },
        {
            "id": 5,
            "base": base_data()[0]["id"],
            "name": "Joggers",
            "category": all_product_category_data()[0]["id"],
            "gender": all_product_gender_data()[4]["id"],
            "size_range": size_range_data()[2]["id"],
            "in_shop": 0,
            "price": 11,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": all_standard_product_data()[0]["id"],
        },
        {
            "id": 6,
            "base": base_data()[0]["id"],
            "name": "Joggers",
            "category": all_product_category_data()[0]["id"],
            "gender": all_product_gender_data()[4]["id"],
            "size_range": size_range_data()[2]["id"],
            "in_shop": 0,
            "price": 12,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": datetime(2024, 1, 1),
            "standard_product": all_standard_product_data()[0]["id"],
        },
        {
            "id": 7,
            "base": base_data()[2]["id"],
            "name": "Joggers",
            "category": all_product_category_data()[0]["id"],
            "gender": all_product_gender_data()[4]["id"],
            "size_range": size_range_data()[2]["id"],
            "in_shop": 1,
            "price": 13,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": all_standard_product_data()[0]["id"],
        },
        {
            "id": 8,
            "base": base_data()[0]["id"],
            "name": "Rice",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": mass_dimension_data()["id"],
            "in_shop": 0,
            "price": 1,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": None,
        },
        {
            "id": 9,
            "base": base_data()[0]["id"],
            "name": "Milk",
            "category": default_product_category_data()["id"],
            "gender": default_product_gender_data()["id"],
            "size_range": volume_dimension_data()["id"],
            "in_shop": 0,
            "price": 1,
            "comment": None,
            "created_by": default_user_data()["id"],
            "deleted_on": None,
            "standard_product": None,
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
def disabled_standard_product(products):
    return products[5]


@pytest.fixture
def base1_products(products):
    return [
        products[0],
        products[2],
        products[3],
        products[4],
        products[5],
        products[7],
        products[8],
    ]


@pytest.fixture
def base1_undeleted_products(products):
    return [products[0], products[2], products[4], products[7], products[8]]


def create():
    Product.insert_many(data()).execute()
