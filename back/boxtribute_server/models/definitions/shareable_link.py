from peewee import CharField, DateTimeField, IntegerField

from ...db import db
from ...enums import ShareableView
from ..fields import EnumCharField, UIntForeignKeyField
from .user import User


class ShareableLink(db.Model):  # type: ignore
    code = CharField(unique=True, max_length=255)
    valid_until = DateTimeField(null=True)
    view = EnumCharField(choices=ShareableView, max_length=255)
    base_id = IntegerField(null=True)
    url_parameters = CharField(null=True, max_length=65535)
    created_on = DateTimeField()
    created_by = UIntForeignKeyField(
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )

    class Meta:
        legacy_table_names = False
