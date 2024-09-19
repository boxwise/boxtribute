from peewee import DateTimeField, IntegerField

from ...db import db
from ...enums import TaggableObjectType
from ..fields import EnumCharField, UIntForeignKeyField
from .tag import Tag
from .user import User


class TagsRelation(db.Model):  # type: ignore
    object_id = IntegerField()
    object_type = EnumCharField(
        choices=TaggableObjectType,
        default=TaggableObjectType.Beneficiary,
    )
    tag = UIntForeignKeyField(column_name="tag_id", field="id", model=Tag)
    created_on = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = DateTimeField(null=True)
    deleted_by = UIntForeignKeyField(
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "tags_relations"
