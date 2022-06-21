"""Utilities for handling authorization"""
from flask import g

from .exceptions import Forbidden, UnknownResource
from .models.definitions.base import Base
from .models.definitions.transfer_agreement import TransferAgreement


def authorize(
    current_user=None,
    *,
    user_id=None,
    organisation_id=None,
    organisation_ids=None,
    base_id=None,
    permission=None,
):
    """Check whether the current user (default: `g.user`) is authorized to access the
    specified resource.
    The god user is authorized to access anything.
    This function is supposed to be used in resolver functions. It may raise an
    UnknownResource or Forbidden exception which ariadne handles by extending the
    'errors' field of the response.
    There are no HTTP 4xx status codes associated with the error since a GraphQL
    response is returned as 200 acc. to specification.
    """
    if current_user is None:
        current_user = g.user
    if current_user.is_god:
        return True

    if permission is not None:
        authorized = current_user.has_permission(permission)

        if authorized and base_id is not None:
            # Enforce base-specific permission
            base_ids = current_user.authorized_base_ids(permission)
            authorized = True if base_ids is None else base_id in base_ids
    elif organisation_id is not None:
        authorized = organisation_id == current_user.organisation_id
    elif organisation_ids is not None:
        authorized = current_user.organisation_id in organisation_ids
    elif user_id is not None:
        authorized = user_id == current_user.id
    else:
        raise UnknownResource()

    if authorized:
        return authorized
    else:
        for value, resource in zip(
            [user_id, organisation_id, base_id, permission],
            ["user", "organisation", "base", "permission"],
        ):
            if value is not None:
                break
        raise Forbidden(resource, value, current_user.__dict__)


def base_filter_condition(permission):
    """Derive filter condition for given permission depending the current user's
    base-specific permissions. See also `auth.requires_auth()`.
    """
    base_ids = g.user.authorized_base_ids(permission)
    if base_ids is None:
        # Permission granted for all bases
        return True
    return Base.id << base_ids


def agreement_organisation_filter_condition():
    """Derive filter condition for accessing transfer agreements depending on the user's
    organisation. The god user may access any agreement.
    """
    if g.user.is_god:
        return True
    return (TransferAgreement.source_organisation == g.user.organisation_id) | (
        TransferAgreement.target_organisation == g.user.organisation_id
    )
