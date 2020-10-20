from boxwise_flask.models.base import Base


def test_model_method():

    Base.create(
        id=1, organisation_id=1, name="some text1", currency_name="hello", seq=1
    )
    Base.create(
        id=2, organisation_id=1, name="some text1", currency_name="hello", seq=1
    )
    Base.create(
        id=3, organisation_id=1, name="some text1", currency_name="hello", seq=1
    )
    Base.create(
        id=4, organisation_id=1, name="some text1", currency_name="hello", seq=1
    )
    Base.create(
        id=5, organisation_id=1, name="some text1", currency_name="hello", seq=1
    )

    x = Base.get_all_bases()
    assert len(x) == 5
