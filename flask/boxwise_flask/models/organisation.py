from boxwise_flask.db import db
from peewee import SQL, CharField, DateTimeField, DeferredForeignKey


class Organisation(db.Model):
    created = DateTimeField(null=True)
    created_by = DeferredForeignKey(
        "User",
        column_name="created_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    deleted = DateTimeField(null=True, default=None)
    name = CharField(column_name="label", null=True)
    modified = DateTimeField(null=True)
    modified_by = DeferredForeignKey(
        "User",
        column_name="modified_by",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )

    class Meta:
        table_name = "organisations"
