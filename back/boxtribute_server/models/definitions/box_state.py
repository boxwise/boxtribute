from peewee import CharField

from . import Model


class BoxState(Model):
    label = CharField(unique=True)

    class Meta:
        table_name = "box_state"
