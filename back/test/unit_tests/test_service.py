from unittest.mock import MagicMock

import pytest
from auth0 import Auth0Error
from boxtribute_server.cli.service import Auth0Service


class Service(Auth0Service):
    def __init__(self):
        # All attributes of _interface will be MagicMocks, too
        self._interface = MagicMock()


def test_remove_base_access_error_handling():
    service = Service()
    service._interface.roles.list.side_effect = [
        Auth0Error(404, "Not found", "User with given ID does not exist"),
    ]
    with pytest.raises(RuntimeError):
        service.get_single_base_user_role_ids(1)

    service._interface.users.update.side_effect = [
        None,
        Auth0Error(404, "Not found", "User with given ID does not exist"),
    ]
    with pytest.raises(RuntimeError):
        service.block_single_base_users([{"user_id": 1}, {"user_id": 2}])

    service._interface.roles.delete.side_effect = [
        None,
        Auth0Error(404, "Not found", "Role with given ID does not exist"),
        Auth0Error(429, "Rate limit exceeded", "The rate limit was exceeded"),
    ]
    with pytest.raises(RuntimeError):
        service.remove_roles(["rol_a", "rol_b", "rol_c"])
