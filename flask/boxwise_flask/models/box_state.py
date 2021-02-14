from boxwise_flask.db import db
from peewee import CharField


class BoxState(db.Model):
    label = CharField(unique=True)

    class Meta:
        table_name = "box_state"
