from peewee import CharField, DateTimeField

from ...db import db
from ..fields import UIntForeignKeyField
from .user import User


class Organisation(db.Model):  # type: ignore
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = DateTimeField(null=True, default=None, column_name="deleted")
    name = CharField(column_name="label")
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "organisations"
