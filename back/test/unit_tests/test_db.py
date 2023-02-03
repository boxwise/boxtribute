import pytest
from boxtribute_server.db import create_db_interface


@pytest.mark.parametrize(
    "kwargs",
    [
        {},
        {"host": "0.0.0.0"},
        {"host": "0.0.0.0", "port": 42},
        {"host": "0.0.0.0", "port": 42, "user": "db-user"},
        {"host": "0.0.0.0", "port": 42, "user": "db-user", "password": "secret"},
    ],
)
def test_create_db_interface_with_none_fields(kwargs):
    with pytest.raises(ValueError):
        create_db_interface(**kwargs)
