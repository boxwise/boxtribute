from peewee import MySQLDatabase
from playhouse.flask_utils import FlaskDB  # type: ignore

db = FlaskDB()


def create_db_interface(**mysql_kwargs):
    """Create MySQL database interface using given connection parameters. `mysql_kwargs`
    are forwarded to `pymysql.connect`.
    Configure primary keys to be unsigned integer.
    """
    return MySQLDatabase(
        **mysql_kwargs, field_types={"AUTO": "INTEGER UNSIGNED AUTO_INCREMENT"}
    )
