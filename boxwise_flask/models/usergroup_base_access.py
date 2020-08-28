from peewee import CompositeKey, IntegerField

from ..db import db


class UsergroupBaseAccess(db.Model):
    camp_id = IntegerField()
    cms_usergroups_id = IntegerField()

    class Meta:
        # UsergroupBaseAccess has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("camp_id", "cms_usergroups_id")
        table_name = "cms_usergroups_camps"

    def __str__(self):
        return self.name

    @staticmethod
    def get_base_id(usergroup_id):
        return UsergroupBaseAccess.select(UsergroupBaseAccess.camp_id).where(
            UsergroupBaseAccess.cms_usergroups_id == usergroup_id
        )
