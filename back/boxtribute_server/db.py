from flask import request
from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore

from .blueprints import API_GRAPHQL_PATH, APP_GRAPHQL_PATH, api_bp, app_bp
from .business_logic.statistics import statistics_queries
from .utils import in_development_environment


class DatabaseManager(FlaskDB):
    """Custom class to glue Flask and Peewee together.
    If configured accordingly, connect to a database replica for statistics-related
    GraphQL queries. To use the replica for database queries, wrap the calling code in
    `with db.replica.bind_ctx`.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.replica = None

    def init_app(self, app):
        self.replica = app.config.get("DATABASE_REPLICA")  # expecting peewee.Database
        super().init_app(app)

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
            or (
                request.blueprint == api_bp.name
                and request.path == "/public"
                and in_development_environment()
            )
        ):
            return

        self.database.connect()

        # Provide fallback for non-JSON and non-GraphQL requests
        payload = request.get_json(silent=True) or {"query": []}
        if self.replica and any([q in payload["query"] for q in statistics_queries()]):
            self.replica.connect()

    def close_db(self, exc):
        if not self.database.is_closed():
            self.database.close()

        if self.replica and not self.replica.is_closed():
            self.replica.close()


db = DatabaseManager()


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
