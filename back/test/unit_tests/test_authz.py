import pytest
from boxtribute_server.auth import CurrentUser
from boxtribute_server.authz import authorize
from boxtribute_server.exceptions import Forbidden, UnknownResource

ALL_PERMISSIONS = [
    "base:read",
    "beneficiary:read",
    "category:read",
    "location:read",
    "product:read",
    "shipment:read",
    "stock:read",
    "transaction:read",
    "transfer_agreement:read",
    "user:read",
    "qr:read",
    "beneficiary:create",
    "beneficiary:edit",
    "shipment:write",
    "stock:write",
    "transfer_agreement:write",
    "qr:create",
]


def test_authorized_user():
    user = CurrentUser(id=3, organisation_id=2)
    assert authorize(user, organisation_id=2)
    assert authorize(user, user_id=3)

    user = CurrentUser(id=3, organisation_id=2, base_ids=ALL_PERMISSIONS)
    assert authorize(user, permission="base:read")
    assert authorize(user, permission="beneficiary:read")
    assert authorize(user, permission="category:read")
    assert authorize(user, permission="location:read")
    assert authorize(user, permission="product:read")
    assert authorize(user, permission="shipment:read")
    assert authorize(user, permission="stock:read")
    assert authorize(user, permission="transaction:read")
    assert authorize(user, permission="transfer_agreement:read")
    assert authorize(user, permission="user:read")
    assert authorize(user, permission="qr:read")
    assert authorize(user, permission="beneficiary:create")
    assert authorize(user, permission="beneficiary:edit")
    assert authorize(user, permission="shipment:write")
    assert authorize(user, permission="stock:write")
    assert authorize(user, permission="transfer_agreement:write")
    assert authorize(user, permission="qr:create")

    user = CurrentUser(
        id=3,
        organisation_id=2,
        base_ids={
            "qr:create": [1, 3],
            "stock:write": [2],
            "location:write": None,
        },
    )
    assert authorize(user, permission="qr:create")
    assert authorize(user, permission="qr:create", base_id=3)
    assert authorize(user, permission="stock:write", base_id=2)
    assert authorize(user, permission="location:write")
    assert authorize(user, permission="location:write", base_id=4)


def test_user_with_insufficient_permissions():
    user = CurrentUser(id=3, organisation_id=2, base_ids={})
    for permission in ALL_PERMISSIONS:
        with pytest.raises(Forbidden):
            authorize(user, permission=permission)

    user = CurrentUser(id=3, organisation_id=2, base_ids={"beneficiary:create": [2]})
    with pytest.raises(Forbidden):
        authorize(user, permission="beneficiary:create", base_id=1)


def test_user_unauthorized_for_organisation():
    user = CurrentUser(id=1, organisation_id=1)
    with pytest.raises(Forbidden):
        authorize(user, organisation_id=2)


def test_user_unauthorized_for_user():
    user = CurrentUser(id=1, organisation_id=1)
    with pytest.raises(Forbidden):
        authorize(user, user_id=2)


def test_invalid_authorization_resource():
    with pytest.raises(UnknownResource):
        authorize(current_user=CurrentUser(id=1, organisation_id=1))


def test_god_user():
    user = CurrentUser(id=0, organisation_id=0, is_god=True)
    for permission in ALL_PERMISSIONS:
        assert authorize(user, permission=permission)
