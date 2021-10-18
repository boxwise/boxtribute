from peewee import CharField

from ..db import db


class BoxState(db.Model):
    label = CharField(unique=True)

    class Meta:
        table_name = "box_state"
