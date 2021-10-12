"""Utilities for handling authentication"""
import json
import os
import urllib
from functools import wraps

from jose import jwt

from flask import g, request

from .exceptions import AuthenticationFailed, Forbidden, UnknownResource

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
ALGORITHMS = ["RS256"]


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
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header(get_auth_string_from_header())
        public_key = get_public_key()
        payload = decode_jwt(token, public_key)

        # The user's base IDs are listed in the JWT under the custom claim (added by
        # a rule in Auth0):
        #     'https://www.boxtribute.com/base_ids'
        # Note: this isn't a real website, and doesn't have to be, but it DOES have
        # to be in this form to work with the Auth0 rule providing it.
        g.user = {}
        prefix = "https://www.boxtribute.com"
        g.user["base_ids"] = payload[f"{prefix}/base_ids"]
        g.user["organisation_id"] = payload[f"{prefix}/organisation_id"]
        g.user["id"] = int(payload["sub"].replace("auth0|", ""))
        g.user["permissions"] = payload["permissions"]

        return f(*args, **kwargs)

    return decorated


def authorize(*, user_id=None, organisation_id=None, base_id=None, permission=None):
    """Check whether the current user is authorized to access the specified
    resource.
    This function is supposed to be used in resolver functions. It may raise an
    UnknownResource or Forbidden exception which ariadne handles by extending the
    'errors' field of the response.
    There are no HTTP 4xx status codes associated with the error since a GraphQL
    response is returned as 200 acc. to specification.
    """
    if base_id is not None:
        authorized = user_can_access_base(g.user, base_id)
    elif organisation_id is not None:
        authorized = organisation_id == g.user["organisation_id"]
    elif user_id is not None:
        authorized = user_id == g.user["id"]
    elif permission is not None:
        authorized = permission in g.user["permissions"]
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
