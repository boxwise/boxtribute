from peewee import CharField, DateTimeField, IntegerField

from ...db import db
from ...enums import ShareableView
from ..fields import EnumCharField, UIntForeignKeyField
from .user import User


class ShareableLink(db.Model):  # type: ignore
    code = CharField(unique=True)
    valid_until = DateTimeField(null=True)
    view = EnumCharField(choices=ShareableView)
    base_id = IntegerField(null=True)
    url_parameters = CharField(null=True)
    created_on = DateTimeField()
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        legacy_table_names = False
