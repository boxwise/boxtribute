from peewee import CharField, IntegerField

from ...db import db


class SizeRange(db.Model):  # type: ignore
    label = CharField()
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
