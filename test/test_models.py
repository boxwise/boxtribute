from boxwise_flask.models import Camps, Cms_Usergroups_Camps, Cms_Users, Person

from .database_for_testing import with_test_db

MODELS = (Person, Camps, Cms_Usergroups_Camps, Cms_Users)


@with_test_db(MODELS)
def test_model_method():
    """example database model test"""

    Camps.create(
        id="1", organisation_id="Some title", name="some text1", currencyname="hello"
    )
    Camps.create(
        id="2", organisation_id="Some title", name="some text1", currencyname="hello"
    )
    Camps.create(
        id="3", organisation_id="Some title", name="some text1", currencyname="hello"
    )
    Camps.create(
        id="4", organisation_id="Some title", name="some text1", currencyname="hello"
    )
    Camps.create(
        id="5", organisation_id="Some title", name="some text1", currencyname="hello"
    )

    x = Camps.get_all_camps()
    assert len(x) == 5
