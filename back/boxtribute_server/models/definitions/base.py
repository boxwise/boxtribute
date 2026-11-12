from peewee import SQL, CharField, DateTimeField, IntegerField, SmallIntegerField

from ..fields import UIntForeignKeyField
from ..utils import utcnow
from . import Model
from .organisation import Organisation
from .user import User


class Base(Model):
    name = CharField(null=True)
    freeshop_currency_name = CharField(
        column_name="currencyname", constraints=[SQL("DEFAULT 'Tokens'")]
    )
    # Currency code for monetary value of e.g. boxes
    monetary_currency_code = CharField(constraints=[SQL("DEFAULT 'EUR'")])
    adult_age = IntegerField(constraints=[SQL("DEFAULT 15")])
    # created_on
    created = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    cycle_start = DateTimeField(column_name="cyclestart", default=utcnow, null=True)
    days_to_keep_inactive_beneficiaries = IntegerField(
        column_name="delete_inactive_users", constraints=[SQL("DEFAULT 30")]
    )
    deleted_on = DateTimeField(null=True, column_name="deleted", default=None)
    token_cap_for_adult = IntegerField(
        column_name="dropcapadult", constraints=[SQL("DEFAULT 99999")]
    )
    token_cap_for_child = IntegerField(
        column_name="dropcapchild", constraints=[SQL("DEFAULT 99999")]
    )
    tokens_per_adult = CharField(
        column_name="dropsperadult", constraints=[SQL("DEFAULT '100'")]
    )
    tokens_per_child = CharField(
        column_name="dropsperchild", constraints=[SQL("DEFAULT '100'")]
    )
    group_identifier = CharField(
        column_name="familyidentifier", constraints=[SQL("DEFAULT 'Container'")]
    )
    modified = DateTimeField(null=True)
    modified_by = UIntForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    organisation = UIntForeignKeyField(
        column_name="organisation_id",
        field="id",
        model=Organisation,
        on_update="CASCADE",
    )
    reset_tokens = IntegerField(
        column_name="resettokens", constraints=[SQL("DEFAULT 0")], null=True
    )
    seq = IntegerField()
    tracking_registered_beneficiaries_enabled = SmallIntegerField(
        column_name="beneficiaryisregistered", constraints=[SQL("DEFAULT '1'")]
    )
    beneficiaries_as_volunteers_enabled = SmallIntegerField(
        column_name="beneficiaryisvolunteer", constraints=[SQL("DEFAULT '1'")]
    )
    separate_shop_and_warehouse_products = SmallIntegerField(
        column_name="separateshopandwhproducts", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_email_enabled = SmallIntegerField(
        column_name="email_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_phone_enabled = SmallIntegerField(
        column_name="phone_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_custom_text_field1_enabled = SmallIntegerField(
        column_name="additional_field1_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_custom_text_field2_enabled = SmallIntegerField(
        column_name="additional_field2_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_custom_number_field_enabled = SmallIntegerField(
        column_name="additional_field3_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_custom_date_field_enabled = SmallIntegerField(
        column_name="additional_field4_enabled", constraints=[SQL("DEFAULT '0'")]
    )
    beneficiary_custom_text_field1_label = CharField(
        column_name="additional_field1_label", max_length=255
    )
    beneficiary_custom_text_field2_label = CharField(
        column_name="additional_field2_label", max_length=255
    )
    beneficiary_custom_number_field_label = CharField(
        column_name="additional_field3_label", max_length=255
    )
    beneficiary_custom_date_field_label = CharField(
        column_name="additional_field4_label", max_length=255
    )

    class Meta:
        table_name = "camps"
