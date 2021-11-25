from peewee import CharField, IntegerField

from ..db import db


class SizeRange(db.Model):
    label = CharField(null=True)
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
