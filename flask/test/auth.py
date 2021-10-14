import json
import os
import urllib


def memoize(function):
    """Wraps a function so the data is cached.
    Each usage of the wrapped function will share the same data
    memoize code from: https://stackoverflow.com/a/815160"""
    memo = {}

    def wrapper(*args):
        if args in memo:
            return memo[args]
        else:
            rv = function(*args)
            memo[args] = rv
        return rv

    return wrapper


def get_user_token():
    """Grabs a user token for Auth0
    Data structure as described here
    https://manage.auth0.com/dashboard/eu/boxtribute-dev/apis/5ef3760527b0da00215e6209/test"""  # line too long # noqa: E501
    token = os.getenv("AUTH0_TEST_JWT")
    if token is not None:
        return token

    auth0_domain = os.getenv("AUTH0_DOMAIN")
    auth0_client_id = os.getenv("AUTH0_CLIENT_TEST_ID")
    auth0_audience = os.getenv("AUTH0_AUDIENCE")
    auth0_secret = os.getenv("AUTH0_CLIENT_SECRET_TEST")
    auth0_username = os.getenv("AUTH0_USERNAME")
    auth0_password = os.getenv("AUTH0_PASSWORD")

    url = "https://" + auth0_domain + "/oauth/token"
    auth_parameters = {
        "client_id": auth0_client_id,
        "audience": auth0_audience,
        "client_secret": auth0_secret,
        "grant_type": "password",
        "username": auth0_username,
        "password": auth0_password,
    }

    for _, v in auth_parameters.items():
        assert v is not None

    headers = {"Content-Type": "application/json"}
    data = json.dumps(auth_parameters).encode("utf-8")
    request = urllib.request.Request(url, data, headers)
    with urllib.request.urlopen(request) as f:
        response = json.loads(f.read().decode())

    assert "error" not in response, response
    return response["access_token"]


@memoize
def get_user_token_string():
    return "Bearer " + get_user_token()


def create_jwt_payload(
    *,
    email=None,
    base_ids=None,
    organisation_id=None,
    roles=None,
    user_id=None,
    permissions=None,
):
    """Create payload containing authorization information of the user requesting from
    the app in the context of testing. The payload field names are identical to the
    actual ones in the JWT returned by Auth0. Irrelevant fields (issues, audience, issue
    time, expiration time, client ID, grant type) are skipped.

    If no arguments are passed, the payload for the default user is returned. Any
    argument specified overrides the corresponding field of the default payload.
    """
    payload = {
        "https://www.boxtribute.com/email": "dev_coordinator@boxaid.org",
        "https://www.boxtribute.com/base_ids": [1],
        "https://www.boxtribute.com/organisation_id": 1,
        "https://www.boxtribute.com/roles": ["Coordinator"],
        "sub": "auth0|8",
        "permissions": [
            "beneficiaries:write",
            "qr:create",
            "stock:write",
            "transactions:write",
        ],
    }

    prefix = "https://www.boxtribute.com"
    for name in ["email", "base_ids", "organisation_id", "roles"]:
        value = locals()[name]
        if value is not None:
            payload[f"{prefix}/{name}"] = value
    if user_id is not None:
        payload["sub"] = f"auth0|{user_id}"
    if permissions is not None:
        payload["permissions"] = permissions

    return payload
