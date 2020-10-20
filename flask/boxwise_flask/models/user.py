from boxwise_flask.db import db
from boxwise_flask.models.language import Language
from boxwise_flask.models.usergroup import Usergroup
from boxwise_flask.models.usergroup_base_access import UsergroupBaseAccess
from peewee import (
    SQL,
    CharField,
    DateField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
)
from playhouse.shortcuts import model_to_dict


class User(db.Model):
    usergroup = ForeignKeyField(
        column_name="cms_usergroups_id", field="id", model=Usergroup, null=True
    )
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by", field="id", model="self", null=True
    )
    deleted = DateTimeField(null=True, default=None)
    email = CharField(null=True, unique=True)
    is_admin = IntegerField(constraints=[SQL("DEFAULT 0")])
    language = ForeignKeyField(
        column_name="language", field="id", model=Language, null=True
    )
    lastaction = DateTimeField()
    lastlogin = DateTimeField()
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model="self", null=True,
    )
    name = CharField(constraints=[SQL("DEFAULT ''")])
    pass_ = CharField(column_name="pass", constraints=[SQL("DEFAULT ''")])
    resetpassword = CharField(null=True)
    valid_firstday = DateField(null=True)
    valid_lastday = DateField(null=True)

    class Meta:
        table_name = "cms_users"

    def __str__(self):
        return self.name

    @staticmethod
    def get_all_users():
        return list(User.select().order_by(User.name))

    @staticmethod
    def get_from_email(email):
        user = User.select().where(User.email == email).get()
        base_ids = []
        if user.usergroup:
            base_ids = UsergroupBaseAccess.get_all_base_id_for_usergroup_id(
                user.usergroup.id
            )
        # base_ids is a peewee ModelSelect (so, many objects).
        # convert to dict 1 at a time,
        # and pull the base_id from that dict, and put in a list
        user.base_id = [model_to_dict(item)["base_id"] for item in base_ids]

        return user
