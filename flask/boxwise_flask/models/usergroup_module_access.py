from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from boxwise_flask.models.base_module import BaseModule
from boxwise_flask.models.usergroup import Usergroup
from peewee import ForeignKeyField


class UsergroupModuleAccess(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    base_module = ForeignKeyField(
        column_name="cms_functions_id", field="id", model=BaseModule, null=True
    )
    usergroup = ForeignKeyField(
        column_name="cms_usergroups_id", field="id", model=Usergroup
    )

    class Meta:
        table_name = "cms_usergroups_functions"
        indexes = ((("cms_functions", "cms_usergroups"), True),)
        primary_key = False
