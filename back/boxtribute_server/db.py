from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore

db = FlaskDB()


def create_db_interface(**mysql_kwargs):
    """Create MySQL database interface using given connection parameters. `mysql_kwargs`
    are validated to not be None and forwarded to `pymysql.connect`.
    Configure primary keys to be unsigned integer.
    """
    for field in ["host", "port", "user", "password", "database"]:
        if mysql_kwargs.get(field) is None:
            raise ValueError(
                f"Field '{field}' for database configuration must not be None"
            )

    return MySQLDatabase(
        **mysql_kwargs, field_types={"AUTO": "INTEGER UNSIGNED AUTO_INCREMENT"}
    )
