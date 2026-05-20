from peewee import CharField

from . import Model


class Size(Model):
    label = CharField()

    class Meta:
        table_name = "sizes"
