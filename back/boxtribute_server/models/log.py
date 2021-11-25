from peewee import CharField, DateTimeField, TextField

from ..db import db


class Log(db.Model):
    content = TextField()
    ip = CharField(null=True)
    date = DateTimeField(column_name="logdate", null=True)
    user = CharField(null=True)

    class Meta:
        table_name = "log"
