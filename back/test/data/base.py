import pytest
from boxtribute_server.models.base import Base
from data.organisation import data as organisation_data


def default_base_data():
    mock_base = {
        "id": 1,
        "name": "the best name",
        "currency_name": "dingo dollars",
        "seq": 1,
        "organisation_id": organisation_data()[0]["id"],
    }
    return mock_base


def default_bases_data():
    bases_dict = {}
    mock_base = default_base_data()
    bases_dict[mock_base["id"]] = mock_base

    mock_base = {
        "id": 2,
        "name": "the second best name",
        "currency_name": "monster munch",
        "seq": 1,
        "organisation_id": organisation_data()[0]["id"],
    }
    bases_dict[mock_base["id"]] = mock_base

    mock_base = {
        "id": 3,
        "name": "harold",
        "currency_name": "mustard",
        "seq": 1,
        "organisation_id": organisation_data()[0]["id"],
    }
    bases_dict[mock_base["id"]] = mock_base

    return bases_dict


@pytest.fixture()
def default_base():
    return default_base_data()


@pytest.fixture()
def default_bases():
    return default_bases_data()


def create():
    for _, base in default_bases_data().items():
        Base.create(**base)
