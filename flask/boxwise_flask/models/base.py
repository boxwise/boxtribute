from datetime import datetime

from boxwise_flask.db import db
from boxwise_flask.models import UnsignedIntegerField
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class Base(db.Model):
    id = UnsignedIntegerField(primary_key=True)
    name = CharField(null=True)
    currency_name = CharField(
        column_name="currencyname", constraints=[SQL("DEFAULT 'Tokens'")]
    )

    adult_age = IntegerField(constraints=[SQL("DEFAULT 15")])

    cycle_start = DateTimeField(
        column_name="cyclestart", default=datetime.now(), null=True
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
        column_name="modified_by", field="id", model=User, null=True,
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

    class Meta:
        table_name = "camps"

    def __str__(self):
        return (
            str(self.id)
            + " "
            + str(self.organisation_id)
            + " "
            + self.name
            + " "
            + self.currency_name
        )

    @staticmethod
    def get_all_bases():
        return list(Base.select().order_by(Base.name))

    @staticmethod
    def get_for_organisation(org_id):
        return list(Base.select().where(Base.organisation_id == org_id))

    @staticmethod
    def get_from_id(base_id):
        return Base.get(Base.id == base_id)
