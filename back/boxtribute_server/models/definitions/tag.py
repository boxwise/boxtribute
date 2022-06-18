from peewee import SQL, CharField, DateTimeField, IntegerField, TextField

from ...db import db
from ..fields import UIntForeignKeyField
from .base import Base
from .user import User


class Tag(db.Model):
    base = UIntForeignKeyField(column_name="camp_id", field="id", model=Base)
    color = CharField()
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by", field="id", model=User, null=True
    )
    deleted = DateTimeField(null=True)
    description = TextField()
    name = CharField(column_name="label")
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        column_name="modified_by", field="id", model=User, null=True
    )
    seq = IntegerField(null=True)
    type = CharField(constraints=[SQL("DEFAULT 'People'")], index=True, null=True)

    class Meta:
        table_name = "tags"
