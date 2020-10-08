from peewee import CharField, IntegerField

from boxwise_flask.db import db


class SizeRange(db.Model):
    label = CharField(null=True)
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
