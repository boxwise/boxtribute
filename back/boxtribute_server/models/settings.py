from peewee import SQL, CharField, DateTimeField, IntegerField, TextField

from ..db import db
from . import UIntDeferredForeignKey


class Settings(db.Model):
    category_id = IntegerField()
    code = CharField(unique=True)
    created = DateTimeField(null=True)
    created_by = UIntDeferredForeignKey(
        "User",
        column_name="created_by",
        field="id",
        null=True,
        on_update="CASCADE",
    )
    description = CharField(null=True)
    hidden = IntegerField(constraints=[SQL("DEFAULT 0")])
    modified = DateTimeField(null=True)
    modified_by = UIntDeferredForeignKey(
        "User",
        column_name="modified_by",
        field="id",
        null=True,
        on_update="CASCADE",
    )
    options = CharField(null=True)
    type = CharField(null=True)
    value = TextField(null=True)

    class Meta:
        table_name = "cms_settings"
