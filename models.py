from peewee import *

from app import mysql


class BaseModel(Model):
    """A base model that will use our MySQL database"""
    class Meta:
        # or derive models from mysql.Model
        database = mysql

class Person(BaseModel):
    firstname = CharField()
    lastname = CharField()
    camp_id = CharField()
    id = CharField()

    def __unicode__(self):
        return self.firstname


class Camps(BaseModel):
    id = CharField()
    organisation_id = CharField()
    name = CharField()

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camps():
    # SELECT distinct id, organisation_id FROM dropapp_dev.camps;
        return (Camps
                .select()
                .order_by(Camps.name))
