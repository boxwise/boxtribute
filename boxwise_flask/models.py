"""Model definitions for database"""
from peewee import CharField

from .app import db


class Person(db.Model):
    firstname = CharField()
    lastname = CharField()
    camp_id = CharField()
    id = CharField()

    def __unicode__(self):
        return self.firstname


class Camps(db.Model):
    id = CharField()
    organisation_id = CharField()
    name = CharField()

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camps():
        # SELECT distinct id, organisation_id FROM dropapp_dev.camps;
        return Camps.select().order_by(Camps.name)
