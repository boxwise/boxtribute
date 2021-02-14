from boxwise_flask.db import db
from peewee import CharField, IntegerField


class SizeRange(db.Model):
    label = CharField(null=True)
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
