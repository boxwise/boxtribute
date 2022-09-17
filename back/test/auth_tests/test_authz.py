import pytest
from boxtribute_server.auth import JWT_CLAIM_PREFIX, CurrentUser
from boxtribute_server.authz import authorize
from boxtribute_server.exceptions import Forbidden, UnknownResource

ALL_PERMISSIONS = {
    "base:read": [1],
    "beneficiary:read": [1],
    "category:read": [1],
    "location:read": [1],
    "product:read": [1],
    "shipment:read": [1],
    "stock:read": [1],
    "transaction:read": [1],
    "transfer_agreement:read": [1],
    "user:read": [1],
    "qr:read": [1],
    "beneficiary:create": [1],
    "beneficiary:edit": [1],
    "shipment:write": [1],
    "stock:write": [1],
    "transfer_agreement:write": [1],
    "qr:create": [1],
}


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
            "location:write": [4],
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

    user = CurrentUser(
        id=3, organisation_id=2, base_ids={"beneficiary:create": [2], "stock:write": []}
    )
    with pytest.raises(Forbidden):
        # The permission field exists but access granted for different base
        authorize(user, permission="beneficiary:create", base_id=1)
    with pytest.raises(Forbidden):
        # The permission field exists but holds no bases
        authorize(user, permission="stock:write", base_id=1)
    with pytest.raises(Forbidden):
        # The permission field exists but holds no bases
        authorize(user, permission="stock:write")
    with pytest.raises(Forbidden):
        # The permission field does not exist
        authorize(user, permission="product:read")


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


def test_user_with_multiple_roles():
    permission = "stock:write"
    # User is Head-of-Ops for base 2 but coordinator for base 1
    payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": 1,
        f"{JWT_CLAIM_PREFIX}/base_ids": [2],
        f"{JWT_CLAIM_PREFIX}/permissions": [permission, f"base_1/{permission}"],
        "sub": "auth0|42",
    }
    user = CurrentUser.from_jwt(payload)
    assert sorted(user.authorized_base_ids(permission)) == [1, 2]

    assert authorize(user, permission=permission, base_id=1)
    assert authorize(user, permission=permission, base_id=2)


def test_non_duplicated_base_ids_when_read_and_write_permissions_given():
    payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": 1,
        f"{JWT_CLAIM_PREFIX}/permissions": [
            "base_3/stock:read",
            "base_3/stock:write",
            "base_4/stock:edit",
            "base_4/stock:read",
        ],
        "sub": "auth0|42",
    }
    user = CurrentUser.from_jwt(payload)
    assert sorted(user.authorized_base_ids("stock:read")) == [3, 4]
    assert sorted(user.authorized_base_ids("stock:write")) == [3]
    assert sorted(user.authorized_base_ids("stock:edit")) == [4]
