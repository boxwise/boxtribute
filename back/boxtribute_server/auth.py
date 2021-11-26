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

        # Any write permission implies read permission on the same resource
        for permission in g.user["permissions"]:
            if permission.endswith(":write"):
                g.user["permissions"].append(permission.replace(":write", ":read"))

        return f(*args, **kwargs)

    return decorated
