"""Model definitions for database."""
from peewee import CharField, CompositeKey, DateField, DateTimeField, IntegerField
from playhouse.shortcuts import model_to_dict

from .db import db


class Person(db.Model):
    id = IntegerField()
    camp_id = IntegerField()
    firstname = CharField()
    lastname = CharField()

    def __str__(self):
        return self.firstname


class Camps(db.Model):
    id = IntegerField()
    organisation_id = IntegerField()
    name = CharField()
    currencyname = CharField()

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
    def get_all_camps():
        return Camps.select().order_by(Camps.name)

    @staticmethod
    def get_camp(camp_id):
        camp = Camps.select().where(Camps.id == camp_id).get()
        return camp


class Cms_Usergroups_Camps(db.Model):
    camp_id = IntegerField()
    cms_usergroups_id = IntegerField()

    class Meta:
        # Cms_Usergroups_Camps has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("camp_id", "cms_usergroups_id")

    def __str__(self):
        return self.name

    @staticmethod
    def get_camp_id(usergroup_id):
        return Cms_Usergroups_Camps.select(Cms_Usergroups_Camps.camp_id).where(
            Cms_Usergroups_Camps.cms_usergroups_id == usergroup_id
        )


class Cms_Users(db.Model):
    id = IntegerField()
    name = CharField(column_name="naam")
    email = CharField()
    cms_usergroups_id = CharField()
    valid_firstday = DateField()
    valid_lastday = DateField()
    lastlogin = DateTimeField()
    lastaction = DateTimeField()

    def __str__(self):
        return self.name, self.organisation_id

    @staticmethod
    def get_all_users():
        return Cms_Users.select().order_by(Cms_Users.name)

    @staticmethod
    def get_user(email):
        user = Cms_Users.select().where(Cms_Users.email == email).get()
        camps = Cms_Usergroups_Camps.get_camp_id(user.cms_usergroups_id)
        # camps is a peewee ModelSelect (so, many objects).
        # convert to dict 1 at a time,
        # and pull the camp_id from that dict, and put in a list
        user.camp_id = [model_to_dict(item)["camp_id"] for item in camps]

        return user
