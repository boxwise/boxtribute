from datetime import datetime

from boxwise_flask.db import db
from boxwise_flask.models.organisation import Organisation
from boxwise_flask.models.user import User
from peewee import SQL, CharField, DateTimeField, ForeignKeyField, IntegerField


class Base(db.Model):
    name = CharField(null=True)
    currency_name = CharField(
        column_name="currencyname", constraints=[SQL("DEFAULT 'Tokens'")]
    )

    adult_age = IntegerField(constraints=[SQL("DEFAULT 15")])

    cyclestart = DateTimeField(default=datetime.now(), null=True)
    daystokeepdeletedpersons = IntegerField(
        constraints=[SQL("DEFAULT 9999")], null=True
    )
    delete_inactive_users = IntegerField(constraints=[SQL("DEFAULT 30")])
    deleted = DateTimeField(null=True, default=None)
    dropcapadult = IntegerField(constraints=[SQL("DEFAULT 99999")])
    dropcapchild = IntegerField(constraints=[SQL("DEFAULT 99999")])
    dropsperadult = CharField(constraints=[SQL("DEFAULT '100'")])
    dropsperchild = CharField(constraints=[SQL("DEFAULT '100'")])
    extraportion = IntegerField(constraints=[SQL("DEFAULT 0")], null=True)
    familyidentifier = CharField(constraints=[SQL("DEFAULT 'Container'")])
    idcard = IntegerField(constraints=[SQL("DEFAULT 0")])
    market = IntegerField(constraints=[SQL("DEFAULT 1")])
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model=User, null=True,
    )
    organisation = ForeignKeyField(
        column_name="organisation_id", field="id", model=Organisation
    )
    resettokens = IntegerField(constraints=[SQL("DEFAULT 0")], null=True)
    schedulebreak = CharField(constraints=[SQL("DEFAULT '1'")])
    schedulebreakduration = CharField(constraints=[SQL("DEFAULT '1'")])
    schedulebreakstart = CharField(constraints=[SQL("DEFAULT '13:00'")])
    schedulestart = CharField(constraints=[SQL("DEFAULT '11:00'")])
    schedulestop = CharField(constraints=[SQL("DEFAULT '17:00'")])
    scheduletimeslot = CharField(constraints=[SQL("DEFAULT '0.5'")])
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
        return Base.select().where(Base.id == base_id).get()
