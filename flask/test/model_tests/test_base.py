import pytest
from boxwise_flask.models.base import Base


@pytest.mark.usefixtures("default_base")
def test_get_base_from_id(default_base):

    base = Base.get_from_id(default_base["id"])
    assert base.id == default_base["id"]
    assert base.seq == default_base["seq"]
    assert base.organisation.id == default_base["organisation_id"]


@pytest.mark.usefixtures("default_bases")
def test_get_base_for_organisation(default_bases):
    first_base_id = list(default_bases.keys())[0]
    bases = Base.get_for_organisation(default_bases[first_base_id]["organisation_id"])
    for base in bases:
        assert base.id == default_bases[base.id]["id"]
        assert base.seq == default_bases[base.id]["seq"]
        assert base.organisation.id == default_bases[base.id]["organisation_id"]


@pytest.mark.usefixtures("default_bases")
def test_get_all_bases(default_bases):
    bases = Base.get_all_bases()
    for base in bases:
        assert base.id == default_bases[base.id]["id"]
        assert base.seq == default_bases[base.id]["seq"]
        assert base.organisation.id == default_bases[base.id]["organisation_id"]
