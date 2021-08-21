from boxwise_flask.db import db
from peewee import CharField, DateTimeField, TextField


class Log(db.Model):
    content = TextField()
    ip = CharField(null=True)
    date = DateTimeField(column_name="logdate", null=True)
    user = CharField(null=True)

    class Meta:
        table_name = "log"
