from boxwise_flask.db import db
from boxwise_flask.models.user import User
from peewee import (
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    SmallIntegerField,
)


class BaseModule(db.Model):
    parent_id = ForeignKeyField("self", null=True, default=None, on_update="CASCADE")
    title_en = CharField(255)
    include = CharField(255)
    seq = IntegerField(default=0)
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(User, null=True, default=None, on_update="CASCADE")
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(User, null=True, default=None, on_update="CASCADE")
    adminonly = SmallIntegerField(default=0)
    visible = SmallIntegerField()
    allusers = SmallIntegerField(default=0)
    allbases = SmallIntegerField(default=0)

    class Meta:
        table_name = "cms_functions"

    def __str__(self):
        return self.id
