import os

from boxtribute_server.auth import JWT_CLAIM_PREFIX, request_jwt

TEST_AUTH0_DOMAIN = "boxtribute-dev.eu.auth0.com"
TEST_AUTH0_AUDIENCE = "boxtribute-dev-api"
TEST_AUTH0_USERNAME = "dev_coordinator@boxaid.org"
TEST_AUTH0_PASSWORD = "Browser_tests"
# Retrieve from JSON via https://$TEST_AUTH0_DOMAIN/.well-known/jwks.json (1st key)
TEST_AUTH0_JWKS_KID = "BXdT34YoNUAu4eloWwPve"
TEST_AUTH0_JWKS_N = "0wGv6p-S8i_1IZjIercpzXl_lhzNG0OM0Ov4TRrQucDzKMPrvw4wYbwx6NYrD0Wqzov5Qmxza1QBKGC3IV5wdi-41ljuiAGqvs3lkG-yXjVxmDMJNijTYuFwXPvDqTKX6VQwMDWIRYTdNuDrvs45xcSJluzhg4iqSQ7smG0C5bFJF-ZweakHoZD91WyfxuykaK1dDBHSbawRezZfhRCy8gvSBVYGp9TcDMxLx0VqpXgBc1s0rnQSH920NXS1Q86etGdCI35Kf5yweLb67RtTr14pK9A1QP9atynhdv9mPQTFcanVbXH0Mw5ypp_kTK5kqSi4K3xVLCzCsW4-r6Af8w"  # noqa


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


@memoize
def fetch_token(username):
    """Grabs a test user access token for Auth0."""
    token = os.getenv("TEST_AUTH0_JWT")
    if token is not None:
        return token

    success, response = request_jwt(
        client_id=os.getenv("TEST_AUTH0_CLIENT_ID"),
        client_secret=os.getenv("TEST_AUTH0_CLIENT_SECRET"),
        audience=TEST_AUTH0_AUDIENCE,
        domain=TEST_AUTH0_DOMAIN,
        username=username,
        password=TEST_AUTH0_PASSWORD,
    )
    return response["access_token"]


def get_authorization_header(username):
    return "Bearer " + fetch_token(username)


def create_jwt_payload(
    *,
    email="dev_coordinator@boxaid.org",
    base_ids=(1,),
    organisation_id=1,
    roles=("Coordinator",),
    user_id=8,
    permissions=None,
):
    """Create payload containing authorization information of the user requesting from
    the app in the context of testing. The payload field names are identical to the
    actual ones in the JWT returned by Auth0 (taking the prefix for custom claims into
    account). Irrelevant fields (issues, audience, issue time, expiration time, client
    ID, grant type) are skipped.

    If no arguments are passed, the payload for the default user is returned. Any
    argument specified overrides the corresponding field of the default payload.
    If `base_ids` is specified, it is used to construct a prefix of form `base_X[-Y...]`
    for the default permissions. If `permissions` is specified too, it overwrites any
    previously set permissions.
    """
    payload = {
        f"{JWT_CLAIM_PREFIX}/email": email,
        f"{JWT_CLAIM_PREFIX}/organisation_id": organisation_id,
        f"{JWT_CLAIM_PREFIX}/base_ids": list(base_ids),
        f"{JWT_CLAIM_PREFIX}/roles": roles,
        "sub": f"auth0|{user_id}",
    }

    if permissions is None:
        base_prefix = f"base_{'-'.join(str(b) for b in base_ids)}"
        payload[f"{JWT_CLAIM_PREFIX}/permissions"] = [
            f"{base_prefix}/base:read",
            f"{base_prefix}/beneficiary:read",
            f"{base_prefix}/category:read",
            f"{base_prefix}/distro_event:write",
            f"{base_prefix}/distro_event:read",
            f"{base_prefix}/location:read",
            f"{base_prefix}/outflow_log:write",
            f"{base_prefix}/outflow_log:read",
            f"{base_prefix}/packing_list_entry:write",
            f"{base_prefix}/packing_list_entry:read",
            f"{base_prefix}/product:read",
            f"{base_prefix}/qr:read",
            f"{base_prefix}/stock:read",
            f"{base_prefix}/transaction:read",
            f"{base_prefix}/unboxed_items_collection:write",
            f"{base_prefix}/unboxed_items_collection:read",
            f"{base_prefix}/user:read",
            f"{base_prefix}/beneficiary:create",
            f"{base_prefix}/beneficiary:edit",
            f"{base_prefix}/qr:create",
            f"{base_prefix}/size:read",
            f"{base_prefix}/size_range:read",
            f"{base_prefix}/stock:write",
            f"{base_prefix}/tag:write",
            f"{base_prefix}/tag_relation:read",
            f"{base_prefix}/tag_relation:assign",
            f"{base_prefix}/transaction:write",
            f"{base_prefix}/history:read",
            "shipment:create",
            "shipment:edit",
            "transfer_agreement:create",
            "transfer_agreement:edit",
        ]
    else:
        payload[f"{JWT_CLAIM_PREFIX}/permissions"] = permissions

    return payload
