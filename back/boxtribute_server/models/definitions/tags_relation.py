from peewee import CompositeKey, IntegerField

from ...db import db
from ...enums import TaggableObjectType
from ..fields import EnumCharField, UIntForeignKeyField
from .tag import Tag


class TagsRelation(db.Model):
    object_id = IntegerField()
    object_type = EnumCharField(
        choices=TaggableObjectType,
        default=TaggableObjectType.Beneficiary,
    )
    tag = UIntForeignKeyField(column_name="tag_id", field="id", model=Tag)

    class Meta:
        table_name = "tags_relations"
        indexes = ((("object_id", "tag", "object_type"), True),)
        primary_key = CompositeKey("object_id", "tag", "object_type")
