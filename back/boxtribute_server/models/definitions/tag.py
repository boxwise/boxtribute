from peewee import CharField, DateTimeField, IntegerField, TextField

from ...enums import TagType
from ..fields import EnumCharField, UIntForeignKeyField, ZeroDateTimeField
from . import Model
from .base import Base
from .user import User


class Tag(Model):
    base = UIntForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        on_update="CASCADE",
        object_id_name="base_id",
    )
    color = CharField()
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = ZeroDateTimeField(column_name="deleted", null=True)
    description = TextField()
    name = CharField(column_name="label")
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        object_id_name="last_modified_by_id",
    )
    seq = IntegerField(null=True)
    type = EnumCharField(
        choices=TagType,
        default=TagType.Beneficiary,
        index=True,
        null=True,
    )

    class Meta:
        table_name = "tags"
