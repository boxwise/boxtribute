from peewee import SQL, CharField, DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField, ZeroDateField
from .language import Language


class User(db.Model):
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted = DateTimeField(null=True, default=None)
    email = CharField(null=True, unique=True)
    is_admin = IntegerField(constraints=[SQL("DEFAULT 0")])
    language = UIntForeignKeyField(
        column_name="language",
        field="id",
        model=Language,
        null=True,
        on_update="CASCADE",
    )
    last_action = DateTimeField(column_name="lastaction")
    last_login = DateTimeField(column_name="lastlogin")
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        column_name="modified_by",
        field="id",
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    name = CharField(column_name="naam", constraints=[SQL("DEFAULT ''")])
    valid_first_day = ZeroDateField(column_name="valid_firstday", null=True)
    valid_last_day = ZeroDateField(column_name="valid_lastday", null=True)

    class Meta:
        table_name = "cms_users"
