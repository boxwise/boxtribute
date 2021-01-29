"""Utilities for handling authentication"""
import json
import os
from functools import wraps

from boxwise_flask.models.user import get_user_from_email_with_base_ids
from flask import _request_ctx_stack, request
from jose import jwt
from six.moves.urllib.request import urlopen

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]
SUCCESS = True
FAILURE = False


# Error handler
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

def get_auth_string_from_header():
    return request.headers.get("Authorization", None)

def get_token_from_auth_header(header_string):
    """Obtains the Access Token from the Authorization Header
    """
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

def add_user_to_request_context(payload):
    _request_ctx_stack.top.current_user = payload

def requires_auth(f):
    """Determines if the Access Token is valid
    """

    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_auth_header(get_auth_string_from_header())
        rsa_key = get_rsa_key(token)
        if rsa_key:
            payload = decode_jwt(token, rsa_key)
            add_user_to_request_context(payload)
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

    token = get_token_from_auth_header(get_auth_string_from_header())
    rsa_key = get_rsa_key(token)
    if rsa_key:
        # the user's email is in the auth token under the custom claim:
        # 'https://www.boxtribute.com/email'
        # note: this isn't a real website, and doesn't have to be,
        # but it DOES have to be in this form to work with the Auth0 rule providing it.
        # this part of the jwt is added by a rule in auth0
        payload = decode_jwt(token, rsa_key)
        email = payload["https://www.boxtribute.com/email"]
        requesting_user = get_user_from_email_with_base_ids(email)

        if test_for == "bases":
            allowed_access = user_can_access_base(requesting_user, kwargs["base_id"])
        # add more test cases here
        else:
            raise AuthError(
                {
                    "code": "unknown resource",
                    "description": "This resource is not known",
                },
                401,
            )

        if allowed_access:
            return allowed_access
        else:
            raise AuthError(
                {
                    "code": "unauthorized_user",
                    "description": "Your user does not have access to this resource",
                },
                401,
            )

def user_can_access_base(requesting_user, base_id):
    if "base_ids" in requesting_user:
        users_bases = requesting_user["base_ids"]
        if base_id in users_bases:
            return SUCCESS
    else:
        #Log error - user doesnt have base ids
        print("user doesnt have base ids cannot validate base_id " + str(base_id))

    return FAILURE
    
