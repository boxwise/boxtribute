from peewee import CharField, IntegerField

from ..db import db


class Base(db.Model):
    organisation_id = IntegerField()
    name = CharField()
    currency_name = CharField(column_name="currencyname")

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
        return Base.select().order_by(Base.name)

    @staticmethod
    def get_bases_by_org_id(org_id):
        return Base.select().where(Base.organisation_id == org_id)

    @staticmethod
    def get_base(base_id):
        base = Base.select().where(Base.id == base_id).get()
        return base
