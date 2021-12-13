import pytest
from boxtribute_server.models.definitions.product_category import ProductCategory


def data():
    return [
        {"id": 12, "name": "Clothing", "parent": None},
        {"id": 13, "name": "Equipment", "parent": None},
        {"id": 1, "name": "Underwear / Nightwear", "parent": 12},
        {"id": 14, "name": "Toys & Games", "parent": 13},
    ]


def default_product_category_data():
    return data()[2]


@pytest.fixture()
def default_product_category():
    return default_product_category_data()


def create():
    ProductCategory.insert_many(data()).execute()
