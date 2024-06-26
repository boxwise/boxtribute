from peewee import SQL, CharField, IntegerField

from ...db import db


class Language(db.Model):  # type: ignore
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
