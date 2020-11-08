from boxwise_flask.db import db
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.user import User
from peewee import CharField, DateTimeField, ForeignKeyField, IntegerField


class Size(db.Model):
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by", field="id", model=User, null=True
    )
    label = CharField()
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model=User, null=True,
    )
    seq = IntegerField(null=True)
    size_range = ForeignKeyField(
        column_name="sizegroup_id", field="id", model=SizeRange, null=True
    )

    class Meta:
        table_name = "sizes"

    def __str__(self):
        return (
            str(self.id)
            + " "
            + str(self.organisation_id)
            + " "
            + self.name
            + " "
            + self.currency_name
        )
