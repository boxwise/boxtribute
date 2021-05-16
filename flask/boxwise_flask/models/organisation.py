from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from peewee import CharField, DateTimeField, DeferredForeignKey


class Organisation(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    created = DateTimeField(null=True)
    created_by = DeferredForeignKey("User", column_name="created_by", null=True)
    deleted = DateTimeField(null=True, default=None)
    label = CharField(null=True)
    modified = DateTimeField(null=True)
    modified_by = DeferredForeignKey("User", column_name="modified_by", null=True)

    class Meta:
        table_name = "organisations"
