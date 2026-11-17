from peewee import SQL, CharField, DateTimeField, IntegerField, TextField

from ...enums import HumanGender
from ..fields import (
    EnumCharField,
    IntAsCharField,
    UIntForeignKeyField,
    ZeroDateField,
    ZeroDateTimeField,
)
from . import Model
from .base import Base
from .user import User


class HumanGenderField(EnumCharField):
    """Custom class to convert the legacy default value '' on DB level to None on
    application level.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, choices=HumanGender, **kwargs)

    def db_value(self, value):
        if value is None or value == HumanGender.Diverse:
            return ""
        return value.value

    def python_value(self, name):
        if name == "":  # called by Beneficiary.select
            return HumanGender.Diverse
        if name is None:  # called in ResourcesForTagLoader
            return HumanGender.Diverse
        return self.enum_class(name)


class Beneficiary(Model):
    signed = IntegerField(column_name="approvalsigned", constraints=[SQL("DEFAULT 0")])
    base = UIntForeignKeyField(
        column_name="camp_id",
        field="id",
        model=Base,
        on_update="CASCADE",
        object_id_name="base_id",
    )
    comment = TextField(column_name="comments", null=True)
    group_identifier = CharField(
        column_name="container", constraints=[SQL("DEFAULT ''")], index=True
    )
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    date_of_birth = ZeroDateField(null=True, constraints=[SQL("DEFAULT NULL")])
    date_of_signature = ZeroDateTimeField(
        default=None, constraints=[SQL("DEFAULT '0000-00-00 00:00:00'")]
    )
    deleted_on = ZeroDateTimeField(column_name="deleted")
    email = CharField(constraints=[SQL("DEFAULT ''")])
    family_id = IntegerField()
    first_name = CharField(column_name="firstname", constraints=[SQL("DEFAULT ''")])
    gender = HumanGenderField(constraints=[SQL("DEFAULT ''")])
    last_name = CharField(column_name="lastname", constraints=[SQL("DEFAULT ''")])
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        object_id_name="last_modified_by_id",
    )
    not_registered = IntegerField(
        column_name="notregistered", constraints=[SQL("DEFAULT 0")], default=False
    )
    family_head = UIntForeignKeyField(
        model="self",
        column_name="parent_id",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        object_id_name="family_head_id",
    )
    phone_number = CharField(column_name="phone", null=True)
    seq = IntegerField()
    signature = TextField(column_name="signaturefield", null=True)
    is_volunteer = IntegerField(
        column_name="volunteer", constraints=[SQL("DEFAULT 0")], default=False
    )
    custom_text_field_1 = CharField(
        column_name="customfield1_value", max_length=255, null=True
    )
    custom_text_field_2 = CharField(
        column_name="customfield2_value", max_length=255, null=True
    )
    custom_number_field = IntAsCharField(
        column_name="customfield3_value", max_length=255, null=True
    )
    custom_date_field = DateTimeField(column_name="customfield4_value", null=True)

    class Meta:
        table_name = "people"
