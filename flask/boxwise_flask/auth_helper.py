"""Utilities for handling authentication"""
import json
import os
import urllib
from functools import wraps

from jose import jwt

from flask import g, request

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]


# Error handler
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


def get_auth_string_from_header():
    return request.headers.get("Authorization", None)


def get_token_from_auth_header(header_string):
    """Obtains the Access Token from the Authorization Header"""
    if not header_string:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )

    parts = header_string.split()

    if parts[0].lower() != "bearer":
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must start with" " Bearer",
            },
            401,
        )
    elif len(parts) == 1:
        raise AuthError(
            {"code": "invalid_header", "description": "Token not found"}, 401
        )
    elif len(parts) > 2:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must be" " Bearer token",
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
            audience=API_AUDIENCE,
            issuer="https://" + AUTH0_DOMAIN + "/",
        )
    except jwt.ExpiredSignatureError:
        raise AuthError(
            {"code": "token_expired", "description": "token is expired"}, 401
        )
    except jwt.JWTClaimsError:
        raise AuthError(
            {
                "code": "invalid_claims",
                "description": "incorrect claims,"
                "please check the audience and issuer",
            },
            401,
        )
    except Exception:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Unable to parse authentication" " token.",
            },
            401,
        )
    return payload


def requires_auth(f):
    """Determines if the Access Token is valid"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header(get_auth_string_from_header())
        public_key = get_public_key()
        if public_key:
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
            g.user["email"] = payload[f"{prefix}/email"]

            return f(*args, **kwargs)
        raise AuthError(
            {"code": "invalid_header", "description": "Unable to find appropriate key"},
            401,
        )

    return decorated


def authorization_test(test_for, **kwargs):
    """To make this applicable to different cases, include an argument of what
    you would like to test for, and the necessary parameters to check.
    E.g. authorization_test("bases", base_id=123)
    """
    if test_for == "bases":
        authorized = user_can_access_base(g.user, str(kwargs["base_id"]))
    elif test_for == "organisation":
        authorized = kwargs["organisation_id"] == g.user["organisation_id"]
    else:
        raise AuthError(
            {
                "code": "unknown resource",
                "description": "This resource is not known",
            },
            401,
        )

    if authorized:
        return authorized
    else:
        raise AuthError(
            {
                "code": "unauthorized_user",
                "description": "Your user does not have access to this resource",
            },
            401,
        )


def user_can_access_base(requesting_user, base_id):
    return base_id in requesting_user.get("base_ids", [])
