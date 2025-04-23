"""Utilities for handling authorization"""

from functools import wraps
from typing import Any, Dict, List, Optional, Tuple, Type

from flask import g
from peewee import Model

from .auth import CurrentUser
from .business_logic.statistics import statistics_queries
from .enums import BoxState, TransferAgreementState
from .errors import InsufficientPermission, UnauthorizedForBase
from .exceptions import Forbidden
from .models.definitions.base import Base
from .models.definitions.organisation import Organisation
from .models.definitions.shipment import Shipment
from .models.definitions.shipment_detail import ShipmentDetail
from .models.definitions.transfer_agreement import TransferAgreement
from .models.definitions.transfer_agreement_detail import TransferAgreementDetail
from .utils import convert_pascal_to_snake_case, in_development_environment

BASE_AGNOSTIC_RESOURCES = (
    "box_state",
    "beneficiary_language",
    "gender",
    "history",
    "language",
    "organisation",
    "product_category",
    "qr",
    "shipment_detail",
    "size",
    "size_range",
    "standard_product",
    "tag_relation",
    "transaction",
    "unit",
    "user",
)


def authorize(*args: CurrentUser, **kwargs: Any) -> bool:
    """Check whether the current user (default: `g.user`) is authorized to access the
    specified resource.
    The god user is authorized to access anything.
    This function is supposed to be used in resolver functions. It may raise a Forbidden
    exception which ariadne handles by extending the 'errors' field of the response.
    There are no HTTP 4xx status codes associated with the error since a GraphQL
    response is returned as 200 acc. to specification.
    """
    kwargs["ignore_missing_base_info"] = False
    return _authorize(*args, **kwargs)


def handle_unauthorized(f):
    """Decorator to handle `Forbidden` exception possibly raised by `_authorize()`.
    Return InsufficientPermission including error information.
    """

    @wraps(f)
    def inner(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Forbidden as e:
            if e.permission is not None:
                return InsufficientPermission(name=e.permission)
            elif e.resource == "base":
                base = (
                    Base.select(Base.id, Base.name, Organisation.name)
                    .join(Organisation)
                    .where(Base.id == e.value)
                    .get_or_none()
                )
                return UnauthorizedForBase(id=e.value, base=base)
            raise e

    return inner


def _authorize(
    current_user: Optional[CurrentUser] = None,
    *,
    user_id: Optional[int] = None,
    organisation_id: Optional[int] = None,
    organisation_ids: Optional[List[int]] = None,
    base_id: Optional[int] = None,
    base_ids: Optional[List[int]] = None,
    permission: Optional[str] = None,
    ignore_missing_base_info: bool = False,
) -> bool:
    """Function for internal use that acts like authorize() but allows for ignoring
    missing base information.
    """
    if current_user is None:
        current_user = g.user
    if current_user.is_god:
        return True

    authorized = False
    if permission is not None:
        resource = permission.split(":")[0]
        if (
            resource not in BASE_AGNOSTIC_RESOURCES
            and base_id is None
            and base_ids is None
            and not ignore_missing_base_info
        ):
            raise ValueError(f"Missing base_id for base-related resource '{resource}'.")

        try:
            # Look up base IDs for given permission. If the user does not have the
            # permission at all, the look-up will result in a KeyError.
            # It is not distinguished between base-related and base-agnostic permissions
            # when decoding the JWT (CurrentUser.from_jwt()), instead base IDs are
            # mapped to every permission.
            authzed_base_ids = current_user.authorized_base_ids(permission)
        except KeyError:
            # Permission not granted for user
            raise Forbidden(permission=permission)

        if authzed_base_ids:
            # Permission field exists and access for at least one base granted.
            # Enforce base-specific permission
            if base_id is not None:
                # User is authorized for specified base
                authorized = int(base_id) in authzed_base_ids
            elif base_ids is not None:
                # User is authorized for at least one of the specified bases
                authorized = any([int(b) in authzed_base_ids for b in base_ids])
            elif resource in BASE_AGNOSTIC_RESOURCES or ignore_missing_base_info:
                authorized = True

    elif organisation_id is not None:
        authorized = organisation_id == current_user.organisation_id
    elif organisation_ids is not None:
        authorized = current_user.organisation_id in organisation_ids
    elif user_id is not None:
        authorized = user_id == current_user.id
    else:
        raise ValueError("Missing argument.")

    if authorized:
        return authorized
    else:
        for value, _resource in zip(
            [base_id, base_ids, organisation_id, organisation_ids, user_id],
            ["base", "bases", "organisation", "organisations", "user"],
        ):
            if value is not None:
                break
        raise Forbidden(resource=_resource, value=value)


def authorized_bases_filter(
    model: Type[Model] = Base,
    *,
    base_fk_field_name: str = "base",
    permission: Optional[str] = None,
) -> bool:
    """Derive base filter condition for given resource model depending the current
    user's base-specific permissions. The resource model must have a FK field referring
    to the Base model named 'base_fk_field_name'.
    The lower-case model name must match the permission resource name. Alternatively
    it's possible to pass a specific permission of form 'resource:action'.
    See also `auth.requires_auth()`.
    """
    if g.user.is_god:
        return True

    if not permission:
        resource = convert_pascal_to_snake_case(model.__name__)
        permission = f"{resource}:read"

    _authorize(permission=permission, ignore_missing_base_info=True)
    base_ids = g.user.authorized_base_ids(permission)
    pattern = Base.id if model is Base else getattr(model, base_fk_field_name)
    return pattern << base_ids


def authorize_for_organisation_bases() -> None:
    """This is an exceptional use for ignoring missing base info. It must be possible to
    read organisations' bases information for anyone. The resolvers for base fields
    (e.g. beneficiaries, products) are guarded with base-specific permission
    enforcement.
    """
    _authorize(permission="base:read", ignore_missing_base_info=True)


def authorize_for_reading_box(box) -> None:
    """Authorize current user for accessing the given box.
    For a box in InTransit, Receiving, or NotDelivered state, users of both source and
    target base of the underlying shipment are allowed to view it.
    Otherwise the user must be permitted to access the base of the box location.
    """
    if box.state_id in [BoxState.InTransit, BoxState.Receiving, BoxState.NotDelivered]:
        detail = (
            ShipmentDetail.select(Shipment)
            .join(Shipment)
            .where(
                ShipmentDetail.box_id == box.id,
                ShipmentDetail.removed_on.is_null(),
                ShipmentDetail.received_on.is_null(),
            )
        ).get()
        authz_kwargs = {
            "base_ids": [detail.shipment.source_base_id, detail.shipment.target_base_id]
        }
    else:
        authz_kwargs = {"base_id": box.location.base_id}
    authorize(permission="stock:read", **authz_kwargs)


def authorize_cross_organisation_access(
    *resources, base_id, current_user: Optional[CurrentUser] = None
) -> None:
    """Check whether the current user (default: `g.user`) is allowed to read-access
    given resources in the specified base (possibly from another organisation).
    If the user does not have direct access to the base, check for an accepted transfer
    agreement involving the bases the user is permitted for, and the specified base.
    If authorization is successful, return None, otherwise raise Forbidden exception.
    """
    current_user = current_user or g.user
    if current_user.is_god:
        return

    if not resources:
        raise ValueError("At least one resource to authorize for must be given")

    base_specific_resources = [r for r in resources if r not in BASE_AGNOSTIC_RESOURCES]
    base_agnostic_resources = [r for r in resources if r in BASE_AGNOSTIC_RESOURCES]

    for resource in base_agnostic_resources:
        permission = f"{resource}:read"
        authorize(current_user, permission=permission)

    if not base_specific_resources:
        # Only had to check for base-agnostic resources above
        return

    # Validate input: it's possible that the specified base does not exist in the
    # database. Still the user is told they're trying to access something they're not
    # permitted to
    base = Base.select(Base.organisation_id).where(Base.id == base_id).get_or_none()
    if base is None:
        raise Forbidden(resource="base", value=base_id)

    # If the base that's about to be accessed belongs to the user's organisation, run
    # try to authorize for all given base-specific resources
    if base.organisation_id == current_user.organisation_id:
        for resource in base_specific_resources:
            permission = f"{resource}:read"
            authorize(current_user, permission=permission, base_id=base_id)
        # At this point, all permissions have successfully been checked
        return

    # The base that's about to be accessed does not belong to the user's organisation.
    # Check for an accepted transfer agreement involving the user's bases and this base
    try:
        # Finding the user's bases is not straightforward since they can differ
        # depending on the resource (e.g. `{"stock:read": [1], "product:read": [2, 3]}`.
        # The strategy is to pick the first of the required permissions, and fetch the
        # corresponding base IDs
        resource = base_specific_resources[0]
        permission = f"{resource}:read"
        user_base_ids = current_user.authorized_base_ids(permission)
    except KeyError:
        # The user already lacks the first base-specific permission
        raise Forbidden(resource="base", value=base_id)

    details = (
        TransferAgreementDetail.select()
        .join(
            TransferAgreement,
            on=(
                (TransferAgreementDetail.transfer_agreement == TransferAgreement.id)
                & (TransferAgreement.state == TransferAgreementState.Accepted)
                & (
                    (
                        (TransferAgreementDetail.source_base << user_base_ids)
                        & (TransferAgreementDetail.target_base == base_id)
                    )
                    | (
                        (TransferAgreementDetail.source_base == base_id)
                        & (TransferAgreementDetail.target_base << user_base_ids)
                    )
                )
            ),
        )
        .get_or_none()
    )

    if details:
        # Albeit accessing cross-organisational data, check that the user at least has
        # the same permissions in their own bases
        for resource in base_specific_resources:
            permission = f"{resource}:read"
            authorize(current_user, permission=permission, base_ids=user_base_ids)
        # At this point, all permissions have successfully been checked
        return

    # Prevent user from accessing data since no sufficient agreement exists
    raise Forbidden(resource="base", value=base_id)


# MUTATIONS_FOR_BETA_LEVEL is a dict with a series of levels, each associated with
# certain available app functionality (mutations). The lowest level provides the least
# functionality, while each of the larger levels additively builds up on the previous
# one. The user's maximum beta-level defines the functionality range that the user can
# access.
DEFAULT_MAX_BETA_LEVEL = 5
MUTATIONS_FOR_BETA_LEVEL: Dict[int, Tuple[str, ...]] = {
    # Mutations for BoxView/BoxEdit pages
    0: ("updateBox",),
    # + mutations for BoxCreate/ScanBox pages
    1: ("updateBox", "createBox", "createQrCode"),
    # + mutations for box-transfer pages
    2: (
        "updateBox",
        "createBox",
        "createQrCode",
        "createTransferAgreement",
        "acceptTransferAgreement",
        "rejectTransferAgreement",
        "cancelTransferAgreement",
        "createShipment",
        "updateShipmentWhenPreparing",
        "updateShipmentWhenReceiving",
        "cancelShipment",
        "sendShipment",
        "startReceivingShipment",
        "markShipmentAsLost",
        "moveNotDeliveredBoxesInStock",
    ),
}
# Beta-level 3 also exists for statistics queries (see below)
MUTATIONS_FOR_BETA_LEVEL[3] = MUTATIONS_FOR_BETA_LEVEL[2] + (
    "deleteBoxes",
    "moveBoxesToLocation",
    "assignTagsToBoxes",
    "unassignTagsFromBoxes",
)
# Beta-level 4 also exists for FE display of ManageProducts
MUTATIONS_FOR_BETA_LEVEL[4] = MUTATIONS_FOR_BETA_LEVEL[3] + (
    "createCustomProduct",
    "editCustomProduct",
    "deleteProduct",
    "enableStandardProduct",
    "editStandardProductInstantiation",
    "disableStandardProduct",
)
MUTATIONS_FOR_BETA_LEVEL[5] = MUTATIONS_FOR_BETA_LEVEL[4] + ("createShareableLink",)
MUTATIONS_FOR_BETA_LEVEL[6] = MUTATIONS_FOR_BETA_LEVEL[5] + (
    # + mutations needed for bulk box creation
    "createTag",
    "updateTag",
    "deleteTag",
)
MUTATIONS_FOR_BETA_LEVEL[7] = MUTATIONS_FOR_BETA_LEVEL[5] + (
    # Level 5 + bulk-beneficiary creation
    "createBeneficiaries",
)
MUTATIONS_FOR_BETA_LEVEL[98] = MUTATIONS_FOR_BETA_LEVEL[6] + (
    # !!!
    # Any new mutation should be added here
    # !!!
    "createBeneficiary",
    "createBeneficiaries",
    "updateBeneficiary",
    "deactivateBeneficiary",
    "assignTag",
    "unassignTag",
)
MUTATIONS_FOR_BETA_LEVEL[99] = MUTATIONS_FOR_BETA_LEVEL[98] + (
    # + mutations for mobile distribution pages
    "createDistributionSpot",
    "createDistributionEvent",
    "addPackingListEntryToDistributionEvent",
    "removePackingListEntryFromDistributionEvent",
    "removeAllPackingListEntriesFromDistributionEventForProduct",
    "updatePackingListEntry",
    "updateSelectedProductsForDistributionEventPackingList",
    "changeDistributionEventState",
    "assignBoxToDistributionEvent",
    "unassignBoxFromDistributionEvent",
    "moveItemsFromBoxToDistributionEvent",
    "removeItemsFromUnboxedItemsCollection",
    "startDistributionEventsTrackingGroup",
    "setReturnedNumberOfItemsForDistributionEventsTrackingGroup",
    "moveItemsFromReturnTrackingGroupToBox",
    "completeDistributionEventsTrackingGroup",
)


def check_user_beta_level(
    payload: Dict[str, Any], *, current_user: Optional[CurrentUser] = None
) -> bool:
    """Check whether the current user has sufficient beta-level to run the operations in
    the payload.
    Fall back to default maximum beta-level if the one assigned to the user is not
    registered.
    For god users, this check is irrelevant.
    """
    current_user = current_user or g.user
    if current_user.is_god:
        return True

    if "query" in payload and any([q in payload for q in statistics_queries()]):
        return current_user.max_beta_level >= 3

    if "mutation" not in payload:
        return True

    if "__schema" in payload and in_development_environment():
        # Enable fetching full schema in GraphQL explorer during development
        return True

    try:
        allowed_mutations = MUTATIONS_FOR_BETA_LEVEL[current_user.max_beta_level]
    except KeyError:
        allowed_mutations = MUTATIONS_FOR_BETA_LEVEL[DEFAULT_MAX_BETA_LEVEL]
    return any([m in payload for m in allowed_mutations])
