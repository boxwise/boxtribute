from boxwise_flask.db import db
from boxwise_flask.models.user import User
from peewee import (
    SQL,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    TextField,
)


class Settings(db.Model):
    category_id = IntegerField()
    code = CharField(unique=True)
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )
    description = CharField(null=True)
    hidden = IntegerField(constraints=[SQL("DEFAULT 0")])
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )
    options = CharField(null=True)
    type = CharField(null=True)
    value = TextField(null=True)

    class Meta:
        table_name = "cms_settings"
