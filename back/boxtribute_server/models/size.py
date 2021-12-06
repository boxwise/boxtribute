from peewee import CharField, DateTimeField, IntegerField

from ..db import db
from . import UIntForeignKeyField
from .size_range import SizeRange
from .user import User


class Size(db.Model):
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    label = CharField()
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    seq = IntegerField(null=True)
    size_range = UIntForeignKeyField(
        column_name="sizegroup_id",
        field="id",
        model=SizeRange,
        null=True,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "sizes"

    def __str__(self):
        return f"{self.id} {self.label}"
