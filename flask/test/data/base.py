import pytest
from boxwise_flask.models.base import Base


@pytest.fixture()
def default_base(default_organisation):
    mock_base = {"id": 1, "seq": 1, "organisation_id": default_organisation["id"]}
    Base.create(**mock_base)
    return mock_base


@pytest.fixture()
def default_bases(default_organisation):
    bases_dict = {}
    mock_base = {"id": 1, "seq": 1, "organisation_id": default_organisation["id"]}
    bases_dict[mock_base["id"]] = mock_base
    Base.create(**mock_base)

    mock_base = {"id": 2, "seq": 1, "organisation_id": default_organisation["id"]}
    bases_dict[mock_base["id"]] = mock_base
    Base.create(**mock_base)

    mock_base = {"id": 3, "seq": 1, "organisation_id": default_organisation["id"]}
    bases_dict[mock_base["id"]] = mock_base
    Base.create(**mock_base)
    return bases_dict
