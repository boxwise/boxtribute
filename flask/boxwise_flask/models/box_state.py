from peewee import CharField

from boxwise_flask.db import db


class BoxState(db.Model):
    label = CharField(unique=True)

    class Meta:
        table_name = "box_state"
