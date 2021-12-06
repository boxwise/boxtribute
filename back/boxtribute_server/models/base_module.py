from peewee import CharField, DateTimeField, IntegerField, SmallIntegerField

from ..db import db
from . import UIntForeignKeyField
from .user import User


class BaseModule(db.Model):
    parent_id = UIntForeignKeyField(
        "self",
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
    )
    title_en = CharField(255, default="")
    include = CharField(255, default="")
    seq = IntegerField(default=0)
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        User,
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
    )
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        User,
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
    )
    admin_only = SmallIntegerField(column_name="adminonly", default=0)
    visible = SmallIntegerField()
    all_users = SmallIntegerField(column_name="allusers", default=0)
    all_bases = SmallIntegerField(column_name="allcamps", default=0)

    class Meta:
        table_name = "cms_functions"
