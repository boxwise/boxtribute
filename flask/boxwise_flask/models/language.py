from boxwise_flask.db import db
from peewee import SQL, CharField, IntegerField


class Language(db.Model):
    code = CharField(null=True)
    locale = CharField(null=True)
    name = CharField(null=True)
    rtl = IntegerField()
    seq = IntegerField(null=True)
    smarty_dateformat = CharField(null=True)
    strftime_dateformat = CharField(null=True)
    visible = IntegerField(constraints=[SQL("DEFAULT 1")])

    class Meta:
        table_name = "languages"
