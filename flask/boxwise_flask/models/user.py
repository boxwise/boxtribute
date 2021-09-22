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
        column_name="cms_usergroups_id",
        field="id",
        model=Usergroup,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    deleted = DateTimeField(null=True, default=None)
    email = CharField(null=True, unique=True)
    is_admin = IntegerField(constraints=[SQL("DEFAULT 0")])
    language = ForeignKeyField(
        column_name="language",
        field="id",
        model=Language,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    last_action = DateTimeField(column_name="lastaction")
    last_login = DateTimeField(column_name="lastlogin")
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model="self",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    name = CharField(column_name="naam", constraints=[SQL("DEFAULT ''")])
    valid_first_day = DateField(column_name="valid_firstday", null=True)
    valid_last_day = DateField(column_name="valid_lastday", null=True)

    class Meta:
        table_name = "cms_users"

    def __str__(self):
        return self.name


def get_user_from_email_with_base_ids(email):
    user = User.get(User.email == email)
    user_dict = model_to_dict(user)
    base_ids = []
    if user.usergroup:
        base_ids = UsergroupBaseAccess.get_all_base_id_for_usergroup_id(
            user.usergroup.id
        )

    user_dict["base_ids"] = base_ids
    return user_dict
