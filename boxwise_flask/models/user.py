from peewee import CharField, DateField, DateTimeField
from playhouse.shortcuts import model_to_dict

from ..db import db
from .usergroup_base_access import UsergroupBaseAccess


class User(db.Model):
    name = CharField(column_name="naam")
    email = CharField()
    usergroup_id = CharField(column_name="cms_usergroups_id")
    valid_firstday = DateField()
    valid_lastday = DateField()
    lastlogin = DateTimeField()
    lastaction = DateTimeField()

    class Meta:
        table_name = "cms_users"

    def __str__(self):
        return self.name, self.organisation_id

    @staticmethod
    def get_all_users():
        return User.select().order_by(User.name)

    @staticmethod
    def get_user(email):
        user = User.select().where(User.email == email).get()
        bases = UsergroupBaseAccess.get_base_id(user.usergroup_id)
        # bases is a peewee ModelSelect (so, many objects).
        # convert to dict 1 at a time,
        # and pull the base_id from that dict, and put in a list
        user.base_id = [model_to_dict(item)["base_id"] for item in bases]

        return user
