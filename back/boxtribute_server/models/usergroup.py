from peewee import CharField, DateTimeField

from ..db import db
from . import UIntDeferredForeignKey, UIntForeignKeyField
from .organisation import Organisation
from .usergroup_access_level import UsergroupAccessLevel


class Usergroup(db.Model):
    created = DateTimeField(null=True)
    created_by = UIntDeferredForeignKey(
        "User",
        column_name="created_by",
        null=True,
        default=None,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted = DateTimeField(null=True, default=None)
    label = CharField(null=True)
    modified = DateTimeField(null=True)
    modified_by = UIntDeferredForeignKey(
        "User",
        column_name="modified_by",
        null=True,
        default=None,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    organisation = UIntForeignKeyField(
        column_name="organisation_id",
        model=Organisation,
        on_update="CASCADE",
    )
    usergroup_access_level = UIntForeignKeyField(
        column_name="userlevel",
        model=UsergroupAccessLevel,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "cms_usergroups"
