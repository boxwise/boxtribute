from boxwise_flask.db import db
from boxwise_flask.models.size_range import SizeRange
from boxwise_flask.models.user import User
from peewee import CharField


class Gender(db.Model):

    id = CharField()
    label = CharField()

    class Meta:
        table_name = "genders"

    def __str__(self):
        return (
            str(self.id)
            + " "
            + str(self.label)
        )
