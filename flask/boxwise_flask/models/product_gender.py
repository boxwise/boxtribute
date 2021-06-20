from boxwise_flask.db import db
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class ProductGender(db.Model):
    adult = IntegerField(constraints=[SQL("DEFAULT 0")])
    baby = IntegerField(constraints=[SQL("DEFAULT 0")])
    child = IntegerField(constraints=[SQL("DEFAULT 0")])
    color = CharField()
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    female = IntegerField(constraints=[SQL("DEFAULT 0")])
    label = CharField()
    male = IntegerField(constraints=[SQL("DEFAULT 0")])
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    seq = IntegerField(null=True)
    short_label = CharField(null=True)

    class Meta:
        table_name = "genders"
