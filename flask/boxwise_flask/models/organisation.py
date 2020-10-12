from boxwise_flask.db import db
from peewee import CharField, DateTimeField, DeferredForeignKey


class Organisation(db.Model):
    created = DateTimeField(null=True)
    created_by = DeferredForeignKey("User")
    deleted = DateTimeField(null=True, default=None)
    label = CharField(null=True)
    modified = DateTimeField(null=True)
    modified_by = DeferredForeignKey("User", null=True)

    class Meta:
        table_name = "organisations"
