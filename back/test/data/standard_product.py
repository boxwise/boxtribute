import pytest
from boxtribute_server.models.definitions.standard_product import StandardProduct

from .product_category import data as all_product_category_data
from .product_gender import data as all_product_gender_data
from .size_range import data as all_size_range_data
from .user import default_user_data


def data():
    return [
        {
            "id": 1,
            "name": "Joggers",
            "category": all_product_category_data()[0]["id"],
            "gender": all_product_gender_data()[4]["id"],
            "size_range": all_size_range_data()[2]["id"],
            "version": 0,
            "added_by": default_user_data()["id"],
        },
        {
            "id": 2,
            "name": "Shorts",
            "category": all_product_category_data()[0]["id"],
            "gender": all_product_gender_data()[0]["id"],
            "size_range": all_size_range_data()[3]["id"],
            "version": 0,
            "added_by": default_user_data()["id"],
        },
    ]


@pytest.fixture
def default_standard_product():
    return data()[0]


@pytest.fixture
def standard_products():
    return data()


def create():
    StandardProduct.insert_many(data()).execute()
