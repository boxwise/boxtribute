import os

import pytest
from boxtribute_server.auth import JWT_CLAIM_PREFIX, CurrentUser
from boxtribute_server.authz import _authorize, authorize, check_beta_feature_access
from boxtribute_server.exceptions import Forbidden

BASE_ID = 1
BASE_RELATED_PERMISSIONS = {
    "base:read": [BASE_ID],
    "beneficiary:create": [BASE_ID],
    "beneficiary:edit": [BASE_ID],
    "beneficiary:read": [BASE_ID],
    "location:read": [BASE_ID],
    "product:read": [BASE_ID],
    "shipment:read": [BASE_ID],
    "shipment:write": [BASE_ID],
    "stock:read": [BASE_ID],
    "stock:write": [BASE_ID],
    "transfer_agreement:read": [BASE_ID],
    "transfer_agreement:write": [BASE_ID],
}
BASE_AGNOSTIC_PERMISSIONS = {
    "box_state:read": [BASE_ID],
    "category:read": [BASE_ID],
    "gender:read": [BASE_ID],
    "language:read": [BASE_ID],
    "organisation:read": [BASE_ID],
    "qr:create": [BASE_ID],
    "qr:read": [BASE_ID],
    "size:read": [BASE_ID],
    "size_range:read": [BASE_ID],
    "transaction:read": [BASE_ID],
    "user:read": [BASE_ID],
}
ALL_PERMISSIONS = {**BASE_AGNOSTIC_PERMISSIONS, **BASE_RELATED_PERMISSIONS}


def test_authorized_user():
    user = CurrentUser(id=3, organisation_id=2)
    assert authorize(user, organisation_id=2)
    assert authorize(user, organisation_ids=[1, 2])
    assert authorize(user, user_id=3)

    user = CurrentUser(id=3, organisation_id=2, base_ids=ALL_PERMISSIONS)
    assert authorize(user, permission="base:read", base_id=BASE_ID)
    assert authorize(user, permission="beneficiary:read", base_id=BASE_ID)
    assert authorize(user, permission="category:read")
    assert authorize(user, permission="location:read", base_id=BASE_ID)
    assert authorize(user, permission="product:read", base_id=BASE_ID)
    assert authorize(user, permission="shipment:read", base_id=BASE_ID)
    assert authorize(user, permission="stock:read", base_id=BASE_ID)
    assert authorize(user, permission="transaction:read")
    assert authorize(user, permission="transfer_agreement:read", base_id=BASE_ID)
    assert authorize(user, permission="user:read")
    assert authorize(user, permission="qr:read")
    assert authorize(user, permission="beneficiary:create", base_id=BASE_ID)
    assert authorize(user, permission="beneficiary:edit", base_id=BASE_ID)
    assert authorize(user, permission="shipment:write", base_id=BASE_ID)
    assert authorize(user, permission="stock:write", base_id=BASE_ID)
    assert authorize(user, permission="transfer_agreement:write", base_id=BASE_ID)
    assert authorize(user, permission="qr:create")

    user = CurrentUser(
        id=3,
        organisation_id=2,
        base_ids={
            "qr:create": [1, 3],
            "stock:write": [2],
            "location:write": [4, 5],
            "product:read": [1],
        },
    )
    assert authorize(user, permission="qr:create")
    assert authorize(user, permission="qr:create", base_id=3)
    assert authorize(user, permission="stock:write", base_id=2)
    assert authorize(user, permission="location:write", base_id=4)
    assert authorize(user, permission="location:write", base_id=5)
    assert authorize(user, permission="location:write", base_ids=[3, 4])
    assert authorize(user, permission="location:write", base_ids=[4, 5])
    assert authorize(user, permission="location:write", base_ids=[5, 6])

    # This is called in authorized_bases_filter for model=Product
    assert _authorize(user, permission="product:read", ignore_missing_base_info=True)


def test_user_with_insufficient_permissions():
    user = CurrentUser(id=3, organisation_id=2, base_ids={})
    for permission in BASE_RELATED_PERMISSIONS:
        with pytest.raises(Forbidden):
            authorize(user, permission=permission, base_id=0)
    for permission in BASE_AGNOSTIC_PERMISSIONS:
        with pytest.raises(Forbidden):
            authorize(user, permission=permission)

    user = CurrentUser(
        id=3, organisation_id=2, base_ids={"beneficiary:create": [2], "stock:write": []}
    )
    with pytest.raises(Forbidden):
        # The permission field exists but access granted for different base
        authorize(user, permission="beneficiary:create", base_id=1)
    with pytest.raises(Forbidden):
        # The permission field exists but access granted for different base
        authorize(user, permission="beneficiary:create", base_ids=[1])
    with pytest.raises(Forbidden):
        # The permission field exists but access granted for different base
        authorize(user, permission="beneficiary:create", base_ids=[3, 4])
    with pytest.raises(Forbidden):
        # The permission field exists but holds no bases
        authorize(user, permission="stock:write", base_id=1)
    with pytest.raises(Forbidden):
        # The permission field exists but holds no bases
        authorize(user, permission="stock:write", base_id=1)
    with pytest.raises(Forbidden):
        # The base-related permission field is not part of the user's permissions
        authorize(user, permission="product:read", base_id=1)
    with pytest.raises(Forbidden):
        # The base-agnostic permission field is not part of the user's permissions
        authorize(user, permission="category:read")


def test_invalid_authorize_function_call():
    user = CurrentUser(id=3, organisation_id=2, base_ids={"beneficiary:create": [2]})
    with pytest.raises(ValueError):
        # Wrong usage for base-related permission (although part of user base_ids)
        authorize(user, permission="beneficiary:create")
    with pytest.raises(ValueError):
        # Wrong usage for base-related resource permission (not part of user base_ids)
        authorize(user, permission="product:read")
    with pytest.raises(ValueError):
        # Missing additional arguments
        authorize(user)


def test_user_unauthorized_for_organisation():
    user = CurrentUser(id=1, organisation_id=1)
    with pytest.raises(Forbidden):
        authorize(user, organisation_id=2)
    with pytest.raises(Forbidden):
        authorize(user, organisation_ids=[2, 3])


def test_user_unauthorized_for_user():
    user = CurrentUser(id=1, organisation_id=1)
    with pytest.raises(Forbidden):
        authorize(user, user_id=2)


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


def test_check_beta_feature_access(mocker):
    # Enable testing of check_beta_feature_access() function
    env_variables = os.environ.copy()
    env_variables["CI"] = "false"
    del env_variables["ENVIRONMENT"]
    mocker.patch("os.environ", env_variables)

    # User with scope 0 cannot access any features (only queries)
    current_user = CurrentUser(id=1, beta_feature_scope=0)
    for mutation in ["createQrCode", "createShipment", "createTag"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_beta_feature_access(payload, current_user=current_user)
    assert check_beta_feature_access(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with scope 1 can only access selected features
    current_user = CurrentUser(id=1, beta_feature_scope=1)
    for mutation in ["createShipment", "createTag"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_beta_feature_access(payload, current_user=current_user)
    for mutation in ["createQrCode"]:
        payload = f"mutation {{ {mutation} }}"
        assert check_beta_feature_access(payload, current_user=current_user)
    assert check_beta_feature_access(
        "query { base(id: 1) { name } }", current_user=current_user
    )
