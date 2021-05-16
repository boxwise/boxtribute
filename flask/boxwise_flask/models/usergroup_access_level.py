from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from peewee import CharField, IntegerField


class UsergroupAccessLevel(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    label = CharField(null=True)
    level = IntegerField(null=True)
    shortlabel = CharField(null=True)

    class Meta:
        table_name = "cms_usergroups_levels"
