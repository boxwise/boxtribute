from peewee import CharField, IntegerField

from ..db import db


class Bases(db.Model):
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
        return Bases.select().order_by(Bases.name)

    @staticmethod
    def get_camps_by_org_id(org_id):
        return Bases.select().where(Bases.organisation_id == org_id)

    @staticmethod
    def get_camp(camp_id):
        camp = Bases.select().where(Bases.id == camp_id).get()
        return camp
