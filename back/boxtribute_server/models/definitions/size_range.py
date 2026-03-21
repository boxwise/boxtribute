from peewee import CharField, IntegerField

from . import Model


class SizeRange(Model):
    label = CharField()
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
