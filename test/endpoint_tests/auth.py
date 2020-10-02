import os

import requests


def memoize(function):
    """Wraps a function so the data is cached.
    Each usage of the wrapped function will share the same data
    memoize code from: https://stackoverflow.com/a/815160 """
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

    auth0_domain = os.getenv("AUTH0_DOMAIN")
    auth0_client_id = os.getenv("AUTH0_CLIENT_ID")
    auth0_audience = os.getenv("AUTH0_AUDIENCE")
    auth0_secret = os.getenv("AUTH0_CLIENT_SECRET")
    auth0_username = os.getenv("AUTH0_USERNAME")
    auth0_password = os.getenv("AUTH0_PASSWORD")

    url = "https://" + auth0_domain + "/oauth/token"
    headers = {"content-type": "application/json"}
    parameters = {
        "client_id": auth0_client_id,
        "audience": auth0_audience,
        "client_secret": auth0_secret,
        "grant_type": "client_credentials",
        "username": auth0_username,
        "password": auth0_password,
    }
    response = requests.post(url, json=parameters, headers=headers).json()
    return response["access_token"]


@memoize
def get_user_token_header():
    return {"authorization": "Bearer " + get_user_token()}
