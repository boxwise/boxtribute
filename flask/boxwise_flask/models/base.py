from datetime import datetime

from boxwise_flask.db import db
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.user import User
from peewee import (
    SQL,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    SmallIntegerField,
)


class Base(db.Model):
    name = CharField(null=True)
    currency_name = CharField(
        column_name="currencyname", constraints=[SQL("DEFAULT 'Tokens'")]
    )

    adult_age = IntegerField(constraints=[SQL("DEFAULT 15")])
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    cycle_start = DateTimeField(
        column_name="cyclestart", default=datetime.utcnow(), null=True
    )
    days_to_keep_deleted_persons = IntegerField(
        column_name="daystokeepdeletedpersons",
        constraints=[SQL("DEFAULT 9999")],
        null=True,
    )
    delete_inactive_users = IntegerField(constraints=[SQL("DEFAULT 30")])
    deleted = DateTimeField(null=True, default=None)
    dropcap_adult = IntegerField(
        column_name="dropcapadult", constraints=[SQL("DEFAULT 99999")]
    )
    dropcap_child = IntegerField(
        column_name="dropcapchild", constraints=[SQL("DEFAULT 99999")]
    )
    dropsper_adult = CharField(
        column_name="dropsperadult", constraints=[SQL("DEFAULT '100'")]
    )
    dropsper_child = CharField(
        column_name="dropsperchild", constraints=[SQL("DEFAULT '100'")]
    )
    extra_portion = IntegerField(
        column_name="extraportion", constraints=[SQL("DEFAULT 0")], null=True
    )
    family_identifier = CharField(
        column_name="familyidentifier", constraints=[SQL("DEFAULT 'Container'")]
    )
    idcard = IntegerField(column_name="idcard", constraints=[SQL("DEFAULT 0")])
    market = IntegerField(constraints=[SQL("DEFAULT 1")])
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    organisation = ForeignKeyField(
        column_name="organisation_id", field="id", model=Organisation
    )
    reset_tokens = IntegerField(
        column_name="resettokens", constraints=[SQL("DEFAULT 0")], null=True
    )
    schedule_break = CharField(
        column_name="schedulebreak", constraints=[SQL("DEFAULT '1'")]
    )
    schedule_break_duration = CharField(
        column_name="schedulebreakduration", constraints=[SQL("DEFAULT '1'")]
    )
    schedule_break_start = CharField(
        column_name="schedulebreakstart", constraints=[SQL("DEFAULT '13:00'")]
    )
    schedule_start = CharField(
        column_name="schedulestart", constraints=[SQL("DEFAULT '11:00'")]
    )
    schedule_stop = CharField(
        column_name="schedulestop", constraints=[SQL("DEFAULT '17:00'")]
    )
    schedule_timeslot = CharField(
        column_name="scheduletimeslot", constraints=[SQL("DEFAULT '0.5'")]
    )
    seq = IntegerField()
    beneficiary_is_registered = SmallIntegerField(
        column_name="beneficiaryisregistered", constraints=[SQL("DEFAULT '1'")]
    )
    beneficiary_is_volunteer = SmallIntegerField(
        column_name="beneficiaryisvolunteer", constraints=[SQL("DEFAULT '1'")]
    )
    separate_shop_and_warehouse_products = SmallIntegerField(
        column_name="separateshopandwhproducts", constraints=[SQL("DEFAULT '0'")]
    )

    class Meta:
        table_name = "camps"
