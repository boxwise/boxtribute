from boxwise_flask.db import db
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.user import User
from peewee import CharField, DateTimeField, ForeignKeyField, IntegerField


class Gender(db.Model):

    id = CharField()
    label = CharField()


    # created = DateTimeField(null=True)
    # created_by = ForeignKeyField(
    #     column_name="created_by", field="id", model=User, null=True
    # )
    # modified = DateTimeField(null=True)
    # modified_by = ForeignKeyField(
    #     column_name="modified_by", field="id", model=User, null=True,
    # )
    # seq = IntegerField(null=True)
    # size_range = ForeignKeyField(
    #     column_name="sizegroup_id", field="id", model=SizeRange, null=True
    # )

    class Meta:
        table_name = "genders"

    def __str__(self):
        return (
            str(self.id)
            + " "
            + str(self.label)
        )
