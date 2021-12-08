from peewee import CharField, DateTimeField

from ...db import db
from ..fields import UIntDeferredForeignKey


class Organisation(db.Model):
    created = DateTimeField(null=True)
    created_by = UIntDeferredForeignKey(
        "User",
        column_name="created_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted = DateTimeField(null=True, default=None)
    name = CharField(column_name="label", null=True)
    modified = DateTimeField(null=True)
    modified_by = UIntDeferredForeignKey(
        "User",
        column_name="modified_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "organisations"
