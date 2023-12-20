from flask import request
from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore

from .business_logic.statistics import statistics_queries


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
        if self._excluded_routes and request.endpoint in self._excluded_routes:
            return
        self.database.connect()

        payload = request.get_json()["query"]
        if self.replica and any([q in payload for q in statistics_queries()]):
            self.replica.connect()

    def close_db(self, exc):
        if self._excluded_routes and request.endpoint in self._excluded_routes:
            return
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
