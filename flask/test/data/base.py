import pytest
from boxwise_flask.models.base import Base


@pytest.fixture()
def default_base(default_organisation):
    mock_base = {"id": 1, "seq": 1, "organisation_id": default_organisation["id"]}
    Base.create(**mock_base)
    return mock_base
