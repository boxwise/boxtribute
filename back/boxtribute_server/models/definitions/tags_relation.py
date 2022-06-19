from peewee import SQL, CharField, CompositeKey, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from .tag import Tag


class TagsRelation(db.Model):
    object_id = IntegerField()
    object_type = CharField(constraints=[SQL("DEFAULT 'People'")], null=True)
    tag = UIntForeignKeyField(column_name="tag_id", field="id", model=Tag)

    class Meta:
        table_name = "tags_relations"
        indexes = ((("object_id", "tag"), True),)
        primary_key = CompositeKey("object_id", "tag")
