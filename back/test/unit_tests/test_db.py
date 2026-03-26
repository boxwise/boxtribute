import pytest
from boxtribute_server.app import create_app
from boxtribute_server.db import (
    DatabaseManager,
    create_db_interface,
    current_database,
    execute_sql,
)
from boxtribute_server.routes import api_bp


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


def test_current_database_without_binding():
    with pytest.raises(RuntimeError):
        current_database()


def test_execute_sql_without_binding():
    with pytest.raises(RuntimeError):
        execute_sql(query="SELECT 1")


def test_unitialized_database_manager():
    manager = DatabaseManager()
    app = create_app()
    app.register_blueprint(api_bp)
    with app.test_request_context(method="POST"):
        with pytest.raises(RuntimeError, match="database not set"):
            manager.connect_db()
