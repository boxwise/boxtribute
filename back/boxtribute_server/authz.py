"""Utilities for handling authorization"""
from flask import g

from .exceptions import Forbidden, UnknownResource


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
