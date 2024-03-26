"""Utilities for handling authentication"""

import json
import os
import subprocess
import urllib
from collections import defaultdict
from functools import wraps
from typing import Dict, Tuple

import jwt
from flask import g, request
from sentry_sdk import set_user as set_sentry_user

from .exceptions import AuthenticationFailed

JWT_CLAIM_PREFIX = "https://www.boxtribute.com"
REQUIRED_CLAIMS = ("roles", "permissions", "base_ids", "organisation_id")
GOD_ROLE = "boxtribute_god"


def get_auth_string_from_header():
    return request.headers.get("Authorization", None)


def get_token_from_auth_header(header_string):
    """Obtain access token from the Authorization header. In case of parsing errors
    return error information and relevant HTTP status code.
    """
    if not header_string:
        raise AuthenticationFailed(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
        )

    parts = header_string.split()

    if parts[0].lower() != "bearer":
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with Bearer",
            },
        )
    elif len(parts) == 1:
        raise AuthenticationFailed(
            {"code": "invalid_header", "description": "Token not found"}
        )
    elif len(parts) > 2:
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Authorization header must be Bearer token",
            },
        )

    token = parts[1]
    return token


def get_public_key(domain):
    if key := os.getenv("AUTH0_PUBLIC_KEY"):
        return key

    # https://community.auth0.com/t/how-to-get-public-key-pem-from-jwks-json/60355/4
    response = urllib.request.urlopen(f"https://{domain}/pem")
    cert = response.read()
    p = subprocess.run(
        ["openssl", "x509", "-pubkey", "-noout"], input=cert, capture_output=True
    )
    return p.stdout.decode()


def decode_jwt(*, token, public_key, domain, audience):
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=f"https://{domain}/",
            # Disable verification of issuing date (goes against JWT spec)
            # cf. https://github.com/jpadilla/pyjwt/issues/939
            options={"verify_iat": False},
        )
    except jwt.exceptions.ExpiredSignatureError:
        raise AuthenticationFailed(
            {"code": "token_expired", "description": "token is expired"}
        )
    except jwt.exceptions.InvalidTokenError as e:
        raise AuthenticationFailed(
            {
                "code": "invalid_claims",
                "description": "incorrect claims, "
                "please check the audience and issuer",
                "message": str(e),
            },
        )
    except jwt.exceptions.PyJWTError as e:
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Unable to parse authentication token.",
                "message": str(e),
            },
        )
    except Exception as e:
        raise AuthenticationFailed(
            {
                "code": "internal_server_error",
                "description": "The server could not process the request.",
                "message": str(e),
            },
            500,
        )
    return payload


class CurrentUser:
    """Container of information about the user making the current request.
    For secure access, property and utility methods are provided.
    """

    def __init__(
        self,
        *,
        id,
        organisation_id=None,
        is_god=False,
        base_ids=None,
        beta_feature_scope=None,
        timezone=None,
    ):
        """The `base_ids` field is a mapping of a permission name to a list of base IDs
        that the permission is granted for. However it is never exposed directly to
        avoid accidental manipulation.
        The `organisation_id` field is set to None for god users.
        """
        self._id = id
        self._organisation_id = None if is_god else organisation_id
        self._is_god = is_god
        self._base_ids = base_ids or {}
        self._beta_feature_scope = beta_feature_scope or 0
        self._timezone = timezone

    @classmethod
    def from_jwt(cls, payload):
        """Extract user information from custom claims in JWT payload. The prefix and
        the claim names are set by an Action script in Auth0.

        The `permissions` custom claim contains entries of form
        '[base_X[-Y...]/]resource:method'. If no base prefix is given, the value from
        the `base_ids` custom claim is used (this occurs for the Head-of-Ops user role).

        If a user has multiple roles, their base-specific permissions are aggregated.

        Any write/create/edit/delete permission implies read permission on the same
        resource.

        Examples:
        - base_1/product:read    -> {"product:read": [1]}
        - base_2-3/stock:write   -> {"stock:write": [2, 3], "stock:read": [2, 3]}
        - beneficiary:edit       -> {"beneficiary:edit": [], "beneficiary:read": []}
        - base_1/stock:read, stock:read, base_ids = [2]
                                 -> {"stock:read": [1, 2]}

        If the list in the `roles` custom claim contains "boxtribute_god", the user is a
        god user.

        It is validated that all required claims are present in the JWT. If not, an
        AuthenticationFailed exception is raised.
        """
        missing_claims = [
            cl for cl in REQUIRED_CLAIMS if f"{JWT_CLAIM_PREFIX}/{cl}" not in payload
        ]
        if missing_claims:
            raise AuthenticationFailed(
                {
                    "code": "missing_claims",
                    "description": "Missing custom claims in JWT: "
                    f"{', '.join(missing_claims)}. Please check Auth0.",
                },
            )

        # Use set to collect base IDs, thus avoiding duplicates if both read and write
        # permission are specified for the same resource
        base_ids = defaultdict(set)

        is_god = GOD_ROLE in payload[f"{JWT_CLAIM_PREFIX}/roles"]
        if not is_god:
            for raw_permission in payload[f"{JWT_CLAIM_PREFIX}/permissions"]:
                try:
                    base_prefix, permission = raw_permission.split("/")
                    ids = [int(b) for b in base_prefix[5:].split("-")]
                except ValueError:
                    # Organisation Head-of-Ops don't have base_ prefixes, permission
                    # granted for all bases indicated by custom 'base_ids' claim
                    permission = raw_permission
                    ids = payload[f"{JWT_CLAIM_PREFIX}/base_ids"]
                base_ids[permission].update(ids)

                resource, method = permission.split(":")
                if method in ["write", "create", "edit", "delete"]:
                    base_ids[f"{resource}:read"].update(ids)

        # Convert to regular dict, using list for base IDs (set not JSON serializable)
        base_ids = {permission: list(bases) for permission, bases in base_ids.items()}

        return cls(
            organisation_id=payload[f"{JWT_CLAIM_PREFIX}/organisation_id"],
            beta_feature_scope=payload.get(f"{JWT_CLAIM_PREFIX}/beta_user"),
            id=int(payload["sub"].replace("auth0|", "")),
            timezone=payload.get(f"{JWT_CLAIM_PREFIX}/timezone"),
            is_god=is_god,
            base_ids=base_ids,
        )

    def authorized_base_ids(self, permission):
        return self._base_ids[permission]

    @property
    def beta_feature_scope(self):
        return self._beta_feature_scope

    @property
    def id(self):
        return self._id

    @property
    def organisation_id(self):
        return self._organisation_id

    @property
    def is_god(self):
        return self._is_god

    @property
    def timezone(self):
        return self._timezone


def requires_auth(f):
    """Decorator for an endpoint that requires user authentication. In case of failure,
    an exception incl. HTTP status code is raised. Flask handles it and returns an error
    response.

    If authentication succeeds, user information is extracted from the JWT payload into
    the `user` attribute of the Flask g object. It is then available for the duration of
    the request.
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header(get_auth_string_from_header())
        domain = os.environ["AUTH0_DOMAIN"]
        payload = decode_jwt(
            token=token,
            public_key=get_public_key(domain),
            domain=domain,
            audience=os.environ["AUTH0_AUDIENCE"],
        )
        g.user = CurrentUser.from_jwt(payload)
        set_sentry_user({"id": g.user.id, "jwt_payload": payload})

        return f(*args, **kwargs)

    return decorated


def request_jwt(
    *,
    client_id,
    client_secret,
    audience,
    domain,
    username,
    password,
    grant_type="password",
) -> Tuple[bool, Dict[str, str]]:
    """Request JWT from Auth0 service on given domain, passing any additional
    parameters. Return whether request was successful, and the full response.
    """
    parameters = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": grant_type,
        "audience": audience,
        "username": username,
        "password": password,
    }
    headers = {"Content-Type": "application/json"}
    data = json.dumps(parameters).encode("utf-8")
    url = f"https://{domain}/oauth/token"
    request = urllib.request.Request(url, data, headers)
    try:
        with urllib.request.urlopen(request) as f:
            response = json.loads(f.read().decode())
    except urllib.error.URLError as e:
        # Auth0 returns HTTP error if misconfigured
        response = {"error": e.reason}

    success = "error" not in response
    return success, response
