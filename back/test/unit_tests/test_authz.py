import pytest
from boxtribute_server.auth import (
    GOD_ROLE,
    JWT_CLAIM_PREFIX,
    REQUIRED_CLAIMS,
    CurrentUser,
)
from boxtribute_server.authz import (
    DEFAULT_MAX_BETA_LEVEL,
    MUTATIONS_FOR_BETA_LEVEL,
    _authorize,
    authorize,
    authorize_cross_organisation_access,
    check_user_beta_level,
    handle_unauthorized,
)
from boxtribute_server.business_logic.statistics import statistics_queries
from boxtribute_server.exceptions import AuthenticationFailed, Forbidden

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
    "product_category:read": [BASE_ID],
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
    assert authorize(user, permission="product_category:read")
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
        timezone="Europe/London",
    )
    assert authorize(user, permission="qr:create")
    assert authorize(user, permission="qr:create", base_id=3)
    assert authorize(user, permission="stock:write", base_id=2)
    assert authorize(user, permission="location:write", base_id=4)
    assert authorize(user, permission="location:write", base_id=5)
    assert authorize(user, permission="location:write", base_ids=[3, 4])
    assert authorize(user, permission="location:write", base_ids=[4, 5])
    assert authorize(user, permission="location:write", base_ids=[5, 6])
    assert user.timezone == "Europe/London"

    # This is called in authorized_bases_filter for model=Product
    assert _authorize(user, permission="product:read", ignore_missing_base_info=True)


def test_user_with_insufficient_permissions():
    user = CurrentUser(id=3, organisation_id=2, base_ids={})
    for permission in BASE_RELATED_PERMISSIONS:
        with pytest.raises(Forbidden) as exc_info:
            authorize(user, permission=permission, base_id=0)
        exc = exc_info.value
        assert (
            exc.extensions["description"] == f"You don't have access to '{permission}'"
        )
        assert exc.permission == permission
        assert exc.resource is None
        assert exc.value is None
    for permission in BASE_AGNOSTIC_PERMISSIONS:
        with pytest.raises(Forbidden) as exc_info:
            authorize(user, permission=permission)
        exc = exc_info.value
        assert (
            exc.extensions["description"] == f"You don't have access to '{permission}'"
        )
        assert exc.permission == permission
        assert exc.resource is None
        assert exc.value is None

    user = CurrentUser(
        id=3, organisation_id=2, base_ids={"beneficiary:create": [2], "stock:write": []}
    )
    with pytest.raises(Forbidden) as exc_info:
        # The permission field exists but access granted for different base
        authorize(user, permission="beneficiary:create", base_id=1)
    exc = exc_info.value
    assert exc.extensions["description"] == "You don't have access to 'base=1'"
    assert exc.permission is None
    assert exc.resource == "base"
    assert exc.value == 1
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
        authorize(user, permission="product_category:read")


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
    with pytest.raises(Forbidden) as exc_info:
        authorize(user, organisation_id=2)
        exc = exc_info.value
        assert exc.permission is None
        assert exc.resource == "organisations"
        assert exc.value == 2
    with pytest.raises(Forbidden):
        authorize(user, organisation_ids=[2, 3])


def test_user_unauthorized_for_user():
    user = CurrentUser(id=1, organisation_id=1)
    with pytest.raises(Forbidden) as exc_info:
        authorize(user, user_id=2)
        exc = exc_info.value
        assert exc.permission is None
        assert exc.resource == "organisations"
        assert exc.value == 2


def test_god_user():
    user = CurrentUser(id=0, organisation_id=0, is_god=True)
    for permission in ALL_PERMISSIONS:
        assert authorize(user, permission=permission)

    payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": 1,
        f"{JWT_CLAIM_PREFIX}/base_ids": [2],
        f"{JWT_CLAIM_PREFIX}/permissions": [],
        f"{JWT_CLAIM_PREFIX}/timezone": "Europe/Berlin",
        f"{JWT_CLAIM_PREFIX}/roles": [GOD_ROLE],
        "sub": "auth0|1",
    }
    user = CurrentUser.from_jwt(payload)
    assert user.is_god
    assert user.organisation_id is None


def test_missing_claims():
    correct_payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": 1,
        f"{JWT_CLAIM_PREFIX}/base_ids": [2],
        f"{JWT_CLAIM_PREFIX}/permissions": [],
        f"{JWT_CLAIM_PREFIX}/timezone": "Europe/Berlin",
        f"{JWT_CLAIM_PREFIX}/roles": [GOD_ROLE],
        "sub": "auth0|1",
    }
    for claim in REQUIRED_CLAIMS:
        payload = correct_payload.copy()
        payload.pop(f"{JWT_CLAIM_PREFIX}/{claim}")
        with pytest.raises(AuthenticationFailed, match=f"JWT: {claim}."):
            CurrentUser.from_jwt(payload)


def test_user_with_multiple_roles():
    permission = "stock:write"
    # User is Head-of-Ops for base 2 but coordinator for base 1.
    # Also verify casting of non-integer IDs and max_beta_level
    payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": "1",
        f"{JWT_CLAIM_PREFIX}/base_ids": ["2"],
        f"{JWT_CLAIM_PREFIX}/permissions": [permission, f"base_1/{permission}"],
        f"{JWT_CLAIM_PREFIX}/timezone": "Europe/Berlin",
        f"{JWT_CLAIM_PREFIX}/beta_user": "4",
        f"{JWT_CLAIM_PREFIX}/roles": ["base_2_coordinator"],
        "sub": "auth0|42",
    }
    user = CurrentUser.from_jwt(payload)
    assert user.organisation_id == 1
    assert user.max_beta_level == 4
    assert sorted(user.authorized_base_ids(permission)) == [1, 2]

    assert authorize(user, permission=permission, base_id=1)
    assert authorize(user, permission=permission, base_id=2)
    assert not user.is_god


def test_non_duplicated_base_ids_when_read_and_write_permissions_given():
    payload = {
        f"{JWT_CLAIM_PREFIX}/organisation_id": 1,
        f"{JWT_CLAIM_PREFIX}/base_ids": [3, 4],
        f"{JWT_CLAIM_PREFIX}/permissions": [
            "base_3/stock:read",
            "base_3/stock:write",
            "base_4/stock:edit",
            "base_4/stock:read",
        ],
        f"{JWT_CLAIM_PREFIX}/roles": ["base_3_coordinator", "base_4_coordinator"],
        "sub": "auth0|42",
    }
    user = CurrentUser.from_jwt(payload)
    assert sorted(user.authorized_base_ids("stock:read")) == [3, 4]
    assert sorted(user.authorized_base_ids("stock:write")) == [3]
    assert sorted(user.authorized_base_ids("stock:edit")) == [4]
    assert not user.is_god


def test_check_beta_feature_access(mocker):
    # User with level 0 can only access BoxView/BoxEdit pages, and queries
    max_beta_level = 0
    current_user = CurrentUser(id=1, max_beta_level=max_beta_level, organisation_id=0)
    for mutation in [
        "createQrCode",
        "createBox",
        "createShipment",
        "deleteProduct",
        "deleteBoxes",
        "createTag",
        "createBeneficiary",
    ]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 1 can additionally access BoxCreate/ScanBox pages
    current_user._max_beta_level = 1
    for mutation in [
        "createShipment",
        "deleteProduct",
        "deleteBoxes",
        "createTag",
        "createBeneficiary",
    ]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 2 can additionally access Transfers pages
    current_user._max_beta_level = 2
    for mutation in ["deleteBoxes", "deleteProduct", "createTag", "createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # Level 3 is the default, hence users with unknown level have the same permissions
    current_user._max_beta_level = 50
    for mutation in ["deleteProduct", "createTag", "createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[DEFAULT_MAX_BETA_LEVEL]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 3 can additionally access statviz data,
    # and execute Box bulk actions
    current_user._max_beta_level = 3
    for mutation in ["deleteProduct", "createTag", "createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 4 can additionally access Product pages
    current_user._max_beta_level = 4
    for mutation in ["createShareableLink", "createTag", "createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 5 can additionally access create links
    current_user._max_beta_level = 5
    for mutation in ["createTag", "createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    # User with level 6 can additionally run tag mutations
    current_user._max_beta_level = 6
    for mutation in ["createBeneficiary"]:
        payload = f"mutation {{ {mutation} }}"
        assert not check_user_beta_level(payload, current_user=current_user)
    for mutation in MUTATIONS_FOR_BETA_LEVEL[max_beta_level]:
        payload = f"mutation {{ {mutation} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    for query in statistics_queries():
        payload = f"query {{ {query} }}"
        assert check_user_beta_level(payload, current_user=current_user)
    assert check_user_beta_level(
        "query { base(id: 1) { name } }", current_user=current_user
    )

    current_user = CurrentUser(id=0, organisation_id=0, is_god=True)
    assert check_user_beta_level({}, current_user=current_user)


def test_handle_unauthorized():
    # Verify that handle_unauthorized decorator raises original Forbidden exception
    # instead of returning InsufficientPermission or UnauthorizedForBase object when
    # trying to authorize for resources other than base
    @handle_unauthorized
    def func():
        current_user = CurrentUser(id=1, organisation_id=1)
        authorize(current_user=current_user, user_id=2)

    with pytest.raises(Forbidden) as exc_info:
        func()
    exc = exc_info.value
    assert exc.resource == "user"
    assert exc.value == 2


def test_authorize_cross_organisation_access():
    current_user = CurrentUser(
        id=1, base_ids={"box_state:read": [1]}, organisation_id=1
    )
    # No resource given
    with pytest.raises(ValueError):
        authorize_cross_organisation_access(current_user=current_user, base_id=1)
    # Only base-agnostic resource given
    assert (
        authorize_cross_organisation_access(
            "box_state", current_user=current_user, base_id=1
        )
        is None
    )

    current_user = CurrentUser(id=0, organisation_id=0, is_god=True)
    assert (
        authorize_cross_organisation_access(current_user=current_user, base_id=1)
        is None
    )


def test_invalid_use_of_forbidden_exception():
    with pytest.raises(ValueError):
        Forbidden(permission="stock:write", resource="box", value=1)
