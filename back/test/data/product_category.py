import pytest
from boxtribute_server.models.definitions.product_category import ProductCategory


def data():
    return [
        # Categories that serve as parents must be listed first such that foreign key
        # constraints function at the time of insertion
        {"id": 12, "name": "Clothing", "parent": None},
        {"id": 13, "name": "Equipment", "parent": None},
        {"id": 1, "name": "Underwear / Nightwear", "parent": 12},
        {"id": 6, "name": "Jackets / Outerwear", "parent": 12},
        {"id": 14, "name": "Toys & Games", "parent": 13},
    ]


def default_product_category_data():
    return data()[2]


@pytest.fixture
def default_product_category():
    return default_product_category_data()


@pytest.fixture
def product_categories():
    return data()


def create():
    ProductCategory.insert_many(data()).execute()
