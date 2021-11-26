from peewee import CharField, IntegerField

from ..db import db


class UsergroupAccessLevel(db.Model):
    label = CharField(null=True)
    level = IntegerField(null=True)
    shortlabel = CharField(null=True)

    class Meta:
        table_name = "cms_usergroups_levels"
