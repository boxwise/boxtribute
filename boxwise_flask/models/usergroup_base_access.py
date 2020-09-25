from peewee import CompositeKey, IntegerField

from ..db import db


class UsergroupBaseAccess(db.Model):
    base_id = IntegerField(column_name="camp_id")
    usergroup_id = IntegerField(column_name="cms_usergroups_id")

    class Meta:
        # UsergroupBaseAccess has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("base_id", "usergroup_id")
        table_name = "cms_usergroups_camps"

    def __str__(self):
        return self.name

    @staticmethod
    def get_base_id(usergroup_id):
        return UsergroupBaseAccess.select(UsergroupBaseAccess.base_id).where(
            UsergroupBaseAccess.usergroup_id == usergroup_id
        )
