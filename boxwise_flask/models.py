"""Model definitions for database"""
from peewee import CharField, Model, ForeignKeyField, CompositeKey
from playhouse.shortcuts import model_to_dict
from .app import db
from .routes import app


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
    currencyname = CharField()

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camps():
        return Camps.select().order_by(Camps.name)

    @staticmethod
    def get_camp(camp_id):
        camp = Camps.select().where(Camps.id == camp_id).get()
        app.logger.warn(camp)
        return camp


class Cms_Usergroups_Camps(db.Model):
    camp_id = CharField()
    cms_usergroups_id = CharField()

    class Meta:
        primary_key = CompositeKey('camp_id', 'cms_usergroups_id')

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camp_list(usergroup_id):
        camp_list = (Cms_Usergroups_Camps
            .select(Cms_Usergroups_Camps.camp_id)
            .where(Cms_Usergroups_Camps.cms_usergroups_id == usergroup_id)
            )
        return camp_list


class Cms_Users(db.Model):
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
        camps = Cms_Usergroups_Camps.get_camp_list(q.cms_usergroups_id)
        listOfDicts = list(camps.dicts())
        listOfCamps = []
        for item in listOfDicts:
            listOfCamps.append(item['camp_id'])

        q.camp_id = listOfCamps
        return q

