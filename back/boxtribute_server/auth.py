"""Utilities for handling authentication"""
import json
import os
import urllib
from collections import defaultdict
from functools import wraps

from flask import g, request
from jose import JOSEError, jwt
from sentry_sdk import set_user as set_sentry_user

from .exceptions import AuthenticationFailed

JWT_CLAIM_PREFIX = "https://www.boxtribute.com"


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
    kid = os.getenv("AUTH0_JWKS_KID")
    n = os.getenv("AUTH0_JWKS_N")
    if kid and n:  # pragma: no cover
        return {
            "kty": "RSA",
            "e": "AQAB",
            "use": "sig",
            "kid": kid,
            "n": n,
        }
    url = urllib.request.urlopen(f"https://{domain}/.well-known/jwks.json")
    jwks = json.loads(url.read())
    return jwks["keys"][0]


def decode_jwt(*, token, public_key, domain, audience):
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=f"https://{domain}/",
        )
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed(
            {"code": "token_expired", "description": "token is expired"}
        )
    except jwt.JWTClaimsError:
        raise AuthenticationFailed(
            {
                "code": "invalid_claims",
                "description": "incorrect claims, "
                "please check the audience and issuer",
            },
        )
    except JOSEError as e:
        raise AuthenticationFailed(
            {
                "code": "invalid_header",
                "description": "Unable to parse authentication token.",
                "message": str(e),
            },
        )
    except Exception:
        raise AuthenticationFailed(
            {
                "code": "internal_server_error",
                "description": "The server could not process the request.",
            },
            500,
        )
    return payload


class CurrentUser:
    """Container of information about the user making the current request.
    For secure access, property and utility methods are provided.
    """

    def __init__(self, *, id, organisation_id=None, is_god=False, base_ids=None):
        """The `base_ids` field is a mapping of a permission name to a list of base IDs
        that the permission is granted for. However it is never exposed directly to
        avoid accidental manipulation.
        The `organisation_id` field is set to None for god users.
        """
        self._id = id
        self._organisation_id = None if is_god else organisation_id
        self._is_god = is_god
        self._base_ids = base_ids or {}

    @classmethod
    def from_jwt(cls, payload):
        """Extract user information from custom claims in JWT payload. The prefix and
        the claim names are set by an Action script in Auth0.

        The `permissions` custom claim contains entries of form
        '[base_X[-Y...]/]resource:method'. If no base prefix is given, the value from
        the `base_ids` custom claim is used (this occurs for the Head-of-Ops user role).

        If a user has multiple roles, their base-specific permissions are aggregated.

        Any write/edit permission implies read permission on the same resource.

        Examples:
        - base_1/product:read    -> {"product:read": [1]}
        - base_2-3/stock:write   -> {"stock:write": [2, 3], "stock:read": [2, 3]}
        - beneficiary:edit       -> {"beneficiary:edit": [], "beneficiary:read": []}
        - base_1/stock:read, stock:read, base_ids = [2]
                                 -> {"stock:read": [1, 2]}

        If the permissions custom claim is a list with a single entry "*", it indicates
        that the current user is a god user.
        """
        try:
            is_god = payload[f"{JWT_CLAIM_PREFIX}/permissions"] == ["*"]
        except KeyError:  # pragma: no cover
            raise AuthenticationFailed(
                {
                    "code": "missing_claims",
                    "description": f"Missing custom claim '{JWT_CLAIM_PREFIX}/"
                    "permissions' in JWT. Please check the user's roles in Auth0.",
                },
            )

        base_ids = defaultdict(list)
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
                base_ids[permission].extend(ids)

                resource, method = permission.split(":")
                if method in ["write", "create", "edit"]:
                    base_ids[f"{resource}:read"].extend(ids)

        return cls(
            organisation_id=payload[f"{JWT_CLAIM_PREFIX}/organisation_id"],
            id=int(payload["sub"].replace("auth0|", "")),
            is_god=is_god,
            base_ids=dict(base_ids),
        )

    def authorized_base_ids(self, permission):
        return self._base_ids[permission]

    @property
    def id(self):
        return self._id

    @property
    def organisation_id(self):
        return self._organisation_id

    @property
    def is_god(self):
        return self._is_god


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


def request_jwt(*, client_id, client_secret, audience, domain, username, password):
    """Request JWT from Auth0 service on given domain, passing any additional
    parameters. Return whether request was successful, and the full response.
    """
    parameters = {
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "password",
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
