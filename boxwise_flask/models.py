"""Model definitions for database"""
from peewee import CharField, Model, ForeignKeyField, CompositeKey

from .app import db
from .routes import app


class BaseModel(Model):
    """A base model that will use our MySQL database"""

    class Meta:
        database = db


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
        return Camps.select().order_by(Camps.name)


class Cms_Usergroups_Camps(BaseModel):
    camp_id = CharField()
    cms_usergroups_id = CharField()

    class Meta:
        primary_key = CompositeKey('camp_id', 'cms_usergroups_id')

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camp(usergroup_id):
        camp = (Cms_Usergroups_Camps
            .select(Cms_Usergroups_Camps.camp_id)
            .where(Cms_Usergroups_Camps.cms_usergroups_id == usergroup_id)
            )
        return camp


class Cms_Users(BaseModel):
    id = CharField()
    organisation_id = CharField()
    naam = CharField()
    name = CharField(column_name='naam')
    email = CharField()
    cms_usergroups_id = CharField()
    valid_firstday = CharField()
    valid_lastday = CharField()

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_all_users():
        return Cms_Users.select().order_by(Cms_Users.naam)

    @staticmethod
    def get_user(email):
        q = Cms_Users.select().where(Cms_Users.email == email).get()
        camps = Cms_Usergroups_Camps.get_camp(q.cms_usergroups_id)
        listOfDicts = list(camps.dicts())
        listOfCamps = []
        for item in listOfDicts:
            listOfCamps.append(item['camp_id'])

        q.camp_id = listOfCamps
        return q

