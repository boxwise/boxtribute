"""Utilities for handling authorization"""
from flask import g

from .exceptions import Forbidden, UnknownResource


def authorize(*, user_id=None, organisation_id=None, base_id=None, permission=None):
    """Check whether the current user is authorized to access the specified
    resource.
    This function is supposed to be used in resolver functions. It may raise an
    UnknownResource or Forbidden exception which ariadne handles by extending the
    'errors' field of the response.
    There are no HTTP 4xx status codes associated with the error since a GraphQL
    response is returned as 200 acc. to specification.
    """
    if permission == "qr:create":
        # For the front-end, base-specific distinction when creating QR codes is
        # relevant but not for the back-end (there is no data relationship between
        # QR code and base). The permission is of form 'base_x:qr:create'.
        authorized = any("qr:create" in p for p in g.user["permissions"])

    elif permission is not None:
        authorized = permission in g.user["permissions"]

        if not authorized and base_id is not None:
            # Handle base-specific permission of form 'base_x:...'
            permission = f"base_{base_id}:{permission}"
            authorized = permission in g.user["permissions"]
    elif base_id is not None:
        authorized = user_can_access_base(g.user, base_id)
    elif organisation_id is not None:
        authorized = organisation_id == g.user["organisation_id"]
    elif user_id is not None:
        authorized = user_id == g.user["id"]
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
        raise Forbidden(resource, value, g.user)


def user_can_access_base(requesting_user, base_id):
    return base_id in requesting_user.get("base_ids", [])
