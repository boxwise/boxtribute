from peewee import (
    SQL,
    CharField,
    DateField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    TextField,
)

from ..db import db
from .base import Base
from .user import User


class Beneficiary(db.Model):
    is_signed = IntegerField(
        column_name="approvalsigned", constraints=[SQL("DEFAULT 0")]
    )
    bicycle_ban = DateField(column_name="bicycleban", null=True)
    bicycle_ban_comment = TextField(
        column_name="bicyclebancomment",
    )
    bicycle_training = IntegerField(
        column_name="bicycletraining", constraints=[SQL("DEFAULT 0")]
    )
    base = ForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        on_update="CASCADE",
    )
    comments = TextField(null=True)
    group_identifier = CharField(
        column_name="container", constraints=[SQL("DEFAULT ''")], index=True
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )
    date_of_birth = DateField(null=True)
    date_of_signature = DateTimeField(
        constraints=[SQL("DEFAULT '0000-00-00 00:00:00'")]
    )
    deleted = DateTimeField()
    email = CharField(constraints=[SQL("DEFAULT ''")])
    extra_portion = IntegerField(
        column_name="extraportion", constraints=[SQL("DEFAULT 0")]
    )
    family_id = IntegerField()
    first_name = CharField(column_name="firstname", constraints=[SQL("DEFAULT ''")])
    gender = CharField(constraints=[SQL("DEFAULT ''")])
    language = IntegerField(constraints=[SQL("DEFAULT 5")])
    last_name = CharField(column_name="lastname", constraints=[SQL("DEFAULT ''")])
    laundry_block = IntegerField(
        column_name="laundryblock", constraints=[SQL("DEFAULT 0")]
    )
    laundry_comment = CharField(column_name="laundrycomment", null=True)
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_update="CASCADE",
    )
    not_registered = IntegerField(
        column_name="notregistered", constraints=[SQL("DEFAULT 0")]
    )
    family_head = ForeignKeyField(
        column_name="parent_id",
        field="id",
        model="self",
        null=True,
        on_update="CASCADE",
    )
    pass_ = CharField(column_name="pass", constraints=[SQL("DEFAULT ''")])
    phone = CharField(null=True)
    reset_password = CharField(column_name="resetpassword", null=True)
    seq = IntegerField()
    signature = TextField(column_name="signaturefield", null=True)
    tent = CharField(constraints=[SQL("DEFAULT ''")])
    url = IntegerField(null=True)
    visible = IntegerField(constraints=[SQL("DEFAULT 1")])
    is_volunteer = IntegerField(column_name="volunteer", constraints=[SQL("DEFAULT 0")])
    workshop_ban = DateField(column_name="workshopban", null=True)
    workshop_ban_comment = TextField(
        column_name="workshopbancomment",
    )
    workshop_supervisor = IntegerField(
        column_name="workshopsupervisor", constraints=[SQL("DEFAULT 0")]
    )
    workshop_training = IntegerField(
        column_name="workshoptraining", constraints=[SQL("DEFAULT 0")]
    )

    class Meta:
        table_name = "people"
