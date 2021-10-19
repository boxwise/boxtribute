"""Utilities for handling authorization"""
from flask import g

from .exceptions import Forbidden, UnknownResource


def authorize(
    current_user=None,
    *,
    user_id=None,
    organisation_id=None,
    base_id=None,
    permission=None,
):
    """Check whether the current user (default: `g.user`) is authorized to access the
    specified resource.
    This function is supposed to be used in resolver functions. It may raise an
    UnknownResource or Forbidden exception which ariadne handles by extending the
    'errors' field of the response.
    There are no HTTP 4xx status codes associated with the error since a GraphQL
    response is returned as 200 acc. to specification.
    """
    if current_user is None:
        current_user = g.user

    if permission == "qr:write":
        # For the front-end, base-specific distinction when creating QR codes is
        # relevant but not for the back-end (there is no data relationship between
        # QR code and base). The permission is of form 'base_x:qr:write'.
        authorized = any("qr:write" in p for p in current_user["permissions"])

    elif permission is not None:
        authorized = permission in current_user["permissions"]

        if not authorized and base_id is not None:
            # Handle base-specific permission of form 'base_x:...'
            permission = f"base_{base_id}:{permission}"
            authorized = permission in current_user["permissions"]
    elif base_id is not None:
        authorized = base_id in current_user["base_ids"]
    elif organisation_id is not None:
        authorized = organisation_id == current_user["organisation_id"]
    elif user_id is not None:
        authorized = user_id == current_user["id"]
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
        raise Forbidden(resource, value, current_user)
