from peewee import CharField, IntegerField

from ..db import db


class Base(db.Model):
    organisation_id = IntegerField()
    name = CharField()
    currencyname = CharField()

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
            + self.currencyname
        )

    @staticmethod
    def get_all_bases():
        return Base.select().order_by(Base.name)

    @staticmethod
    def get_for_organisation(org_id):
        return Base.select().where(Base.organisation_id == org_id)

    @staticmethod
    def get_from_id(camp_id):
        camp = Base.select().where(Base.id == camp_id).get()
        return camp
