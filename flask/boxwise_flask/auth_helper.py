"""Utilities for handling authentication"""
import json
import os
from functools import wraps

from flask import _request_ctx_stack, request
from jose import jwt
from six.moves.urllib.request import urlopen
from .models import Cms_Users


AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]


# Error handler
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code


def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header
    """
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            401,
        )

    parts = auth.split()

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


def get_rsa_key(token):
    jsonurl = urlopen("https://" + AUTH0_DOMAIN + "/.well-known/jwks.json")
    jwks = json.loads(jsonurl.read())
    unverified_header = jwt.get_unverified_header(token)
    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            return rsa_key


def decode_jwt(token, rsa_key):
    try:
        payload = jwt.decode(
            token,
            rsa_key,
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
    """Determines if the Access Token is valid
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_auth_header()
        rsa_key = get_rsa_key(token)
        if rsa_key:
            payload = decode_jwt(token, rsa_key)
            _request_ctx_stack.top.current_user = payload
            return f(*args, **kwargs)
        raise AuthError(
            {"code": "invalid_header", "description": "Unable to find appropriate key"},
            401,
        )

    return decorated


def authorization_test(test_for, **kwargs):
    # to make this applicable to different cases,
    # include an argument of what you would like to test for,
    # and dict of the necessary params to check
    # ex) authorization_test("bases", {"base_id":123})
    token = get_token_auth_header()
    rsa_key = get_rsa_key(token)
    if rsa_key:
        # the user's email is in the auth token under the custom claim:
        # 'https://www.boxtribute.com/email'
        # note: this isn't a real website, and doesn't have to be,
        # but it DOES have to be in this form to work with the Auth0 rule providing it.
        payload = decode_jwt(token, rsa_key)
        email = payload['https://www.boxtribute.com/email']
        requesting_user = Cms_Users.get_user(email)

        if test_for == "bases":
            allowed_access = test_base(requesting_user, kwargs["base_id"])
        # add more test cases here
        else:
            raise AuthError(
                {
                    "code": "unknown resource",
                    "description": "This resource is not known"
                }, 401
            )

        if allowed_access:
            return allowed_access
        else:
            raise AuthError(
                {
                    "code": "unauthorized_user",
                    "description": "Your user does not have access to this resource"
                }, 401
            )


def test_base(requesting_user, base_id):
    users_bases = requesting_user.camp_id
    if base_id in users_bases:
        return True
    return False
