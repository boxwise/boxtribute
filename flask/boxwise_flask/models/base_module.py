from boxwise_flask.db import db
from boxwise_flask.models.user import User
from peewee import (
    SQL,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    SmallIntegerField,
)


class BaseModule(db.Model):
    parent_id = ForeignKeyField(
        "self",
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
        constraints=[SQL("UNSIGNED")],
    )
    title_en = CharField(255, default="")
    include = CharField(255, default="")
    seq = IntegerField(default=0)
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        User,
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
        constraints=[SQL("UNSIGNED")],
    )
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        User,
        null=True,
        default=None,
        on_update="CASCADE",
        on_delete="SET NULL",
        constraints=[SQL("UNSIGNED")],
    )
    admin_only = SmallIntegerField(column_name="adminonly", default=0)
    visible = SmallIntegerField()
    all_users = SmallIntegerField(column_name="allusers", default=0)
    all_bases = SmallIntegerField(column_name="allcamps", default=0)

    class Meta:
        table_name = "cms_functions"

    def __str__(self):
        return self.id
