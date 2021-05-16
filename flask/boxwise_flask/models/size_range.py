from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from peewee import CharField, IntegerField


class SizeRange(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    label = CharField(null=True)
    seq = IntegerField(null=True)

    class Meta:
        table_name = "sizegroup"
