from peewee import CharField, DateTimeField, DeferredForeignKey

from boxwise_flask.db import db


class Organisation(db.Model):
    created = DateTimeField(null=True)
    created_by = DeferredForeignKey("User")
    deleted = DateTimeField(null=True, default=None)
    label = CharField(null=True)
    modified = DateTimeField(null=True)
    modified_by = DeferredForeignKey("User")

    class Meta:
        table_name = "organisations"
