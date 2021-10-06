from boxwise_flask.db import db
from peewee import CompositeKey, IntegerField


class UsergroupBaseAccess(db.Model):
    base_id = IntegerField(column_name="camp_id")
    usergroup_id = IntegerField(column_name="cms_usergroups_id")

    class Meta:
        # UsergroupBaseAccess has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("base_id", "usergroup_id")
        table_name = "cms_usergroups_camps"

    @staticmethod
    def get_all_base_id_for_usergroup_id(usergroup_id):
        query = UsergroupBaseAccess.select(UsergroupBaseAccess.base_id).where(
            UsergroupBaseAccess.usergroup_id == usergroup_id
        )
        base_ids = [usergroup_base_access.base_id for usergroup_base_access in query]
        return base_ids
