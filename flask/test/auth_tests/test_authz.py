import pytest
from boxwise_flask.authz import authorize
from boxwise_flask.exceptions import Forbidden, UnknownResource


def test_authorized_user():
    user = {"base_ids": [1], "organisation_id": 2, "id": 3}
    assert authorize(user, base_id=1)
    assert authorize(user, organisation_id=2)
    assert authorize(user, user_id=3)


def test_user_unauthorized_for_base():
    user = {"base_ids": []}
    with pytest.raises(Forbidden):
        authorize(user, base_id=1)

    user = {"base_ids": [2]}
    with pytest.raises(Forbidden):
        authorize(user, base_id=1)


def test_user_unauthorized_for_organisation():
    user = {"organisation_id": 1}
    with pytest.raises(Forbidden):
        authorize(user, organisation_id=2)


def test_user_unauthorized_for_user():
    user = {"id": 1}
    with pytest.raises(Forbidden):
        authorize(user, user_id=2)


def test_invalid_authorization_resource():
    with pytest.raises(UnknownResource):
        authorize(current_user={})
