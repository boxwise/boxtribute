"""Utilities for handling authentication"""
import json
import os
import urllib
from functools import wraps

from flask import g, request
from jose import jwt

from .exceptions import AuthenticationFailed

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
ALGORITHMS = ["RS256"]
JWT_CLAIM_PREFIX = "https://www.boxtribute.com"


def get_auth_string_from_header():
    return request.headers.get("Authorization", None)


def get_token_from_auth_header(header_string):
    """Obtain access token from the Authorization header. In case of parsing errors
    return error information and HTTP status code 401.
    """
    if not header_string:
        raise AuthenticationFailed(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )

    parts = header_string.split()

    if parts[0].lower() != "bearer":
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with Bearer",
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthenticationFailed(
            {"code": "invalid_header", "description": "Token not found"}, 401
        )
    elif len(parts) > 2:
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Authorization header must be Bearer token",
            },
            401,
        )

    token = parts[1]
    return token


def get_public_key():
    url = urllib.request.urlopen("https://" + AUTH0_DOMAIN + "/.well-known/jwks.json")
    jwks = json.loads(url.read())
    return jwks["keys"][0]


def decode_jwt(token, public_key):
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=ALGORITHMS,
            audience=os.getenv("AUTH0_AUDIENCE"),
            issuer="https://" + AUTH0_DOMAIN + "/",
        )
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed(
            {"code": "token_expired", "description": "token is expired"}, 401
        )
    except jwt.JWTClaimsError:
        raise AuthenticationFailed(
            {
                "code": "invalid_claims",
                "description": "incorrect claims, "
                "please check the audience and issuer",
            },
            401,
        )
    except Exception:
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Unable to parse authentication token.",
            },
            401,
        )
    return payload


def requires_auth(f):
    """Decorator for an endpoint that requires user authentication. In case of failure,
    an exception incl. HTTP status code is raised. Flask handles it and returns an error
    response.

    If authentication succeeds, user information is extracted from the JWT payload into
    the `user` attribute of the Flask g object. It is then available for the duration of
    the request.
    The `permissions` field of `g.user` is a mapping of a permission name to a list of
    base IDs that the permission is granted for, or to None if the permission is granted
    for all bases. It is parsed from the `permissions` custom claim which contains
    entries of form '[base_X[-Y...]/]resource:method'. Any write/edit permission implies
    read permission on the same resource. E.g.
    - base_1/product:read    -> {"product:read": [1]}
    - base_2-3/stock:write   -> {"stock:write": [2, 3], "stock:read": [2, 3]}
    - beneficiary:edit       -> {"beneficiary:edit": None, "beneficiary:read": None}
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header(get_auth_string_from_header())
        public_key = get_public_key()
        payload = decode_jwt(token, public_key)

        # The user's organisation ID is listed in the JWT under the custom claim (added
        # by a rule in Auth0):
        #     'https://www.boxtribute.com/organisation_id'
        g.user = {}
        g.user["organisation_id"] = payload[f"{JWT_CLAIM_PREFIX}/organisation_id"]
        g.user["id"] = int(payload["sub"].replace("auth0|", ""))
        g.user["is_god"] = payload[f"{JWT_CLAIM_PREFIX}/permissions"] == ["*"]

        g.user["permissions"] = {}
        if not g.user["is_god"]:
            for raw_permission in payload[f"{JWT_CLAIM_PREFIX}/permissions"]:
                try:
                    base_prefix, permission = raw_permission.split("/")
                    base_ids = [int(b) for b in base_prefix[5:].split("-")]
                except ValueError:
                    # No base_ prefix, permission granted for all bases
                    permission = raw_permission
                    base_ids = None
                g.user["permissions"][permission] = base_ids

                resource, method = permission.split(":")
                if method in ["write", "edit"]:
                    g.user["permissions"][f"{resource}:read"] = base_ids

        return f(*args, **kwargs)

    return decorated
