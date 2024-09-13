import pytest
from boxtribute_server.models.definitions.unit import Unit

from .size_range import mass_dimension_data, volume_dimension_data


def data():
    return [
        {
            "id": 1,
            "name": "kilogram",
            "symbol": "kg",
            "conversion_factor": 1,
            "dimension": mass_dimension_data()["id"],
        },
        {
            "id": 2,
            "name": "liter",
            "symbol": "l",
            "conversion_factor": 1,
            "dimension": volume_dimension_data()["id"],
        },
        {
            "id": 3,
            "name": "milliliter",
            "symbol": "ml",
            "conversion_factor": 1000,
            "dimension": volume_dimension_data()["id"],
        },
        {
            "id": 4,
            "name": "gram",
            "symbol": "g",
            "conversion_factor": 1000,
            "dimension": mass_dimension_data()["id"],
        },
        {
            "id": 7,
            "name": "pound",
            "symbol": "lb",
            "conversion_factor": 2.2046,
            "dimension": mass_dimension_data()["id"],
        },
        {
            "id": 10,
            "name": "pint (US)",
            "symbol": "pt (US)",
            "conversion_factor": 2.1134,
            "dimension": volume_dimension_data()["id"],
        },
    ]


@pytest.fixture
def units():
    return data()


@pytest.fixture
def mass_units():
    return [u for u in data() if u["dimension"] == mass_dimension_data()["id"]]


def create():
    Unit.insert_many(data()).execute()
