from peewee import CharField, DateTimeField, FloatField, IntegerField, TextField

from ...db import db
from ..fields import UIntForeignKeyField
from .user import User


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
    user = UIntForeignKeyField(
        model=User,
        column_name="user_id",
        field="id",
        null=True,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "history"
        indexes = (
            (("record_id", "change_date"), False),
            (("table_name", "record_id", "change_date"), False),
        )
