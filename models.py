from peewee import *
from .app import mysql

class BaseModel(Model):
    """A base model that will use our MySQL database"""
    class Meta:
        database = mysql
class Person(BaseModel):
    firstname = CharField()
    lastname = CharField()
    camp_id = CharField()
    id = CharField()

    def __unicode__(self):
        return self.firstname


class Camp(BaseModel):
    id = CharField()
    organisation_id = CharField()
    name = CharField()

    def __unicode__(self):
        return self.name

    def get_camps(self):
    # SELECT distinct id, organisation_id FROM dropapp_dev.camps;
        return (Camp
                .select()
                .order_by(Camp.name))