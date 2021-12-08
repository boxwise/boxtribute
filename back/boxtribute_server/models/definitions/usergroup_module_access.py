from ...db import db
from ..fields import UIntForeignKeyField
from .base_module import BaseModule
from .usergroup import Usergroup


class UsergroupModuleAccess(db.Model):
    base_module = UIntForeignKeyField(
        column_name="cms_functions_id",
        field="id",
        model=BaseModule,
        on_delete="CASCADE",
        on_update="CASCADE",
    )
    usergroup = UIntForeignKeyField(
        column_name="cms_usergroups_id",
        field="id",
        model=Usergroup,
        on_delete="CASCADE",
        on_update="CASCADE",
    )

    class Meta:
        table_name = "cms_usergroups_functions"
        indexes = ((("cms_functions", "cms_usergroups"), True),)
        primary_key = False
