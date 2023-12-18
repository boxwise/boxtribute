from flask import request
from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore


class DatabaseManager(FlaskDB):
    """Custom class to glue Flask and Peewee together.
    If configured accordingly, connect to a database replica, and use it in SELECT
    SQL queries for read-only GraphQL requests (i.e. NOT for mutations).
    Using the replica for resolving the return field of GraphQL mutations can lead to
    data race-conditions because the data change that occurred in the primary DB
    instance is not yet present in the replica.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.replica = None
        self.mutation_requested = True

    def init_app(self, app):
        self.replica = app.config.get("DATABASE_REPLICA")  # expecting peewee.Database
        super().init_app(app)

    def connect_db(self):
        if self._excluded_routes and request.endpoint in self._excluded_routes:
            return
        self.database.connect()

        self.mutation_requested = b"mutation" in request.data
        if self.replica and not self.mutation_requested:
            self.replica.connect()

    def close_db(self, exc):
        if self._excluded_routes and request.endpoint in self._excluded_routes:
            return
        if not self.database.is_closed():
            self.database.close()

        if (
            self.replica
            and not self.mutation_requested
            and not self.replica.is_closed()
        ):
            self.replica.close()

    def get_model_class(self):
        """Whenever a database model (representing a table) is defined, it must derive
        from `db.Model` which calls this method.
        """
        if self.database is None:
            raise RuntimeError("Database must be initialized.")

        class BaseModel(self.base_model_class):
            @classmethod
            def select(cls, *args, **kwargs):
                if self.replica and not self.mutation_requested:
                    with cls.bind_ctx(self.replica):
                        return super().select(*args, **kwargs)
                return super().select(*args, **kwargs)

            class Meta:
                database = self.database

        return BaseModel


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
