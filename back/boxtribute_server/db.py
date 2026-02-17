from functools import wraps

from flask import request
from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore

from .blueprints import (
    API_GRAPHQL_PATH,
    APP_GRAPHQL_PATH,
    CRON_PATH,
    SHARED_GRAPHQL_PATH,
    api_bp,
    app_bp,
    shared_bp,
)
from .business_logic.statistics import statistics_queries
from .models.definitions import Model


class DatabaseManager(FlaskDB):
    """Custom class to glue Flask and Peewee together.
    If configured accordingly, connect to a database replica for statistics-related
    GraphQL queries. To use the replica for database queries, wrap the calling code in
    the `use_db_replica` decorator, and make sure the replica connection is set up in
    the connect_db() method.
    """

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.replica: MySQLDatabase | None = None

    def connect_db(self):
        # GraphQL queries are sent as POST requests. Don't open database connection on
        # other requests (e.g. CORS pre-flight OPTIONS request)
        if request.method.upper() != "POST":
            return

        # Don't open database connection for URLs other than the GraphQL endpoints
        # defined in routes.py
        if not (
            (request.blueprint == api_bp.name and request.path == API_GRAPHQL_PATH)
            or (request.blueprint == app_bp.name and request.path == APP_GRAPHQL_PATH)
            or (request.blueprint == app_bp.name and request.path.startswith(CRON_PATH))
            or (
                request.blueprint == shared_bp.name
                and request.path == SHARED_GRAPHQL_PATH
            )
        ):
            return

        self.database.connect()

        # Provide fallback for non-JSON and non-GraphQL requests
        payload = request.get_json(silent=True) or {"query": []}
        if self.replica and (
            any([q in payload["query"] for q in statistics_queries()])
            or request.blueprint == shared_bp.name
        ):
            self.replica.connect()

    def close_db(self, exc):
        if not self.database.is_closed():
            self.database.close()

        if self.replica and not self.replica.is_closed():
            self.replica.close()


db = DatabaseManager()


def use_db_replica(f):
    """Decorator for a resolver that should use the DB replica for database selects."""

    @wraps(f)
    def decorated(*args, **kwargs):
        if db.replica is not None:
            # With a complete list of models no need to recursively bind dependencies
            with db.replica.bind_ctx(
                Model.__subclasses__(), bind_refs=False, bind_backrefs=False
            ):
                return f(*args, **kwargs)

        return f(*args, **kwargs)

    return decorated


def create_db_interface(**mysql_kwargs):
    """Create MySQL database interface using given connection parameters. `mysql_kwargs`
    are validated to not be None and forwarded to `pymysql.connect`.
    Configure primary keys to be unsigned integer.
    """
    for field in ["user", "password", "database"]:
        if mysql_kwargs.get(field) is None:
            raise ValueError(
                f"Field '{field}' for database configuration must not be None"
            )

    return MySQLDatabase(
        **mysql_kwargs, field_types={"AUTO": "INTEGER UNSIGNED AUTO_INCREMENT"}
    )


def execute_sql(*params, use_replica=False, query):
    """Utility function to execute a raw SQL query, returning the result rows as dicts.
    By default, the primary database is selected. Any `params` are passed into peewee's
    `execute_sql` method as values for query parameters.
    """
    database = db.replica if use_replica and db.replica is not None else db.database
    cursor = database.execute_sql(query, params=params)
    if cursor.description is None:
        # For e.g. UPDATE statements no description is available
        return
    # Turn cursor result into dict (https://stackoverflow.com/a/56219996/3865876)
    column_names = [x[0] for x in cursor.description]
    return [dict(zip(column_names, row)) for row in cursor.fetchall()]
