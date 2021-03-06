import pytest
from boxwise_flask.models.base import Base
from data.organisation import default_organisation_data


def default_base_data():
    mock_base = {
        "id": 1,
        "name": "the best name",
        "currency_name": "dingo dollars",
        "seq": 1,
        "organisation_id": default_organisation_data()["id"],
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
        "organisation_id": default_organisation_data()["id"],
    }
    bases_dict[mock_base["id"]] = mock_base

    mock_base = {
        "id": 3,
        "name": "harold",
        "currency_name": "mustard",
        "seq": 1,
        "organisation_id": default_organisation_data()["id"],
    }
    bases_dict[mock_base["id"]] = mock_base

    return bases_dict


@pytest.fixture()
def default_base():
    return default_base_data()


@pytest.fixture()
def default_bases():
    return default_bases_data()


def create_default_bases():
    for _, base in default_bases_data().items():
        Base.create(**base)
