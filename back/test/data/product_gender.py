import pytest
from boxtribute_server.models.enums import ProductGender as ProductGenderEnum
from boxtribute_server.models.product_gender import ProductGender


def data():
    return [{"id": p.value, "label": p.name, "color": "red"} for p in ProductGenderEnum]


def default_product_gender_data():
    return data()[0]


@pytest.fixture()
def default_product_gender():
    return default_product_gender_data()


def create():
    ProductGender.insert_many(data()).execute()
