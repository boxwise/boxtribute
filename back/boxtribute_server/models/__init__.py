from datetime import datetime, timezone

from peewee import DeferredForeignKey, ForeignKeyField


def utcnow():
    """Return current datetime in UTC."""
    return datetime.now(tz=timezone.utc)


class UIntForeignKeyField(ForeignKeyField):
    """Work-around field type, since using constraints results in a syntax error.
    Always use this class to reference another model (note that database primary keys
    are unsigned integers).
    Cf. https://github.com/coleifer/peewee/issues/1594#issuecomment-386003608

    Details:
    1. `ForeignKeyField(null=True, constraints=[SQL("UNSIGNED")])` or
       `UIntForeignKeyField(null=True) yield the valid SQL
        ... INTEGER UNSIGNED
    2. `ForeignKeyField(constraints=[SQL("UNSIGNED")])` yields the invalid SQL
        ... INTEGER NOT NULL UNSIGNED
    3. `UIntForeignKeyField()` yields the valid SQL
        ... INTEGER UNSIGNED NOT NULL
    """

    field_type = "INTEGER UNSIGNED"


class UIntDeferredForeignKey(DeferredForeignKey):
    """Work-around field type, since using constraints results in a syntax error.
    Cf. `UIntForeignKeyField`.
    """

    field_type = "INTEGER UNSIGNED"
