from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from peewee import CharField


class BoxState(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    label = CharField(unique=True)

    class Meta:
        table_name = "box_state"
