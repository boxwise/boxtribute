from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
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
    id = UnsignedIntegerField(primary_key=True)
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
    last_action = DateTimeField()
    last_login = DateTimeField()
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model="self", null=True,
    )
    name = CharField(column_name="naam", constraints=[SQL("DEFAULT ''")])
    valid_first_day = DateField(null=True)
    valid_last_day = DateField(null=True)

    class Meta:
        table_name = "cms_users"

    def __str__(self):
        return self.name

    @staticmethod
    def get_all_users():
        return list(User.select().order_by(User.name))

    @staticmethod
    def get_from_email(email):
        return (
            User.select(User.id, User.name, User.email, User.usergroup)
            .where(User.email == email)
            .get()
        )


def get_user_from_email_with_base_ids(email):
    user = User.get_from_email(email)
    user_dict = model_to_dict(user)
    base_ids = []
    if user.usergroup:
        base_ids = UsergroupBaseAccess.get_all_base_id_for_usergroup_id(
            user.usergroup.id
        )

    # base_ids is a peewee ModelSelect (so, many objects).
    # convert to dict 1 at a time,
    # and pull the base_id from that dict, and put in a list

    user_dict["base_ids"] = base_ids
    return user_dict
