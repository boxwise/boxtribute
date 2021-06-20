from boxwise_flask.db import db
from boxwise_flask.models.base_module import BaseModule
from boxwise_flask.models.usergroup import Usergroup
from peewee import SQL, ForeignKeyField


class UsergroupModuleAccess(db.Model):
    base_module = ForeignKeyField(
        column_name="cms_functions_id",
        field="id",
        model=BaseModule,
        on_delete="CASCADE",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    usergroup = ForeignKeyField(
        column_name="cms_usergroups_id",
        field="id",
        model=Usergroup,
        on_delete="CASCADE",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )

    class Meta:
        table_name = "cms_usergroups_functions"
        indexes = ((("cms_functions", "cms_usergroups"), True),)
        primary_key = False
