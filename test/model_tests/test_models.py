from boxwise_flask.models.bases import Bases


def test_model_method():
    """Verify inserting test rows."""

    Bases.create(id=1, organisation_id=1, name="some text1", currencyname="hello")
    Bases.create(id=2, organisation_id=1, name="some text1", currencyname="hello")
    Bases.create(id=3, organisation_id=1, name="some text1", currencyname="hello")
    Bases.create(id=4, organisation_id=1, name="some text1", currencyname="hello")
    Bases.create(id=5, organisation_id=1, name="some text1", currencyname="hello")

    x = Bases.get_all_bases()
    assert len(x) == 5
