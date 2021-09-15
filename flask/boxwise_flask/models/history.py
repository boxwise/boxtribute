from boxwise_flask.db import db
from boxwise_flask.models.user import User
from peewee import (
    CharField,
    DateTimeField,
    FloatField,
    ForeignKeyField,
    IntegerField,
    TextField,
)


class DbChangeHistory(db.Model):
    change_date = DateTimeField(column_name="changedate", null=True)
    changes = TextField()
    from_float = FloatField(null=True)
    from_int = IntegerField(null=True)
    ip = CharField(null=True)
    record_id = IntegerField(null=True)
    table_name = CharField(column_name="tablename", null=True)
    to_float = FloatField(null=True)
    to_int = IntegerField(null=True)
    user = ForeignKeyField(
        column_name="user_id",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "history"
