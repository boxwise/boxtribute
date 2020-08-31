"""Model definitions for database."""
from peewee import CharField, CompositeKey, DateField, DateTimeField, IntegerField
from playhouse.shortcuts import model_to_dict

from .db import db
import time
from datetime import date

# remaining db renames:
# qr -> qrCodes
# cms_functions -> baseModules
# cms_usergroups -> usergroups
# cms_usergroups_levels -> usergroupAccessLevels

class Boxes(db.Model):
    class Meta:
        table_name="Stock"

# id as an integer is the primary key
    box_id = IntegerField()
    product_id = IntegerField()
    size_id = IntegerField()
    items = IntegerField()
    location_id = IntegerField()
    comments = CharField()
    qr_id = IntegerField()
    created = DateTimeField()
    created_by = CharField()
    box_state_id = IntegerField()

    def __unicode__(self):
        return self.box_id

    @staticmethod
    def create_box(box_creation_input):

        today = date.today()
        qr_hash = box_creation_input.get('qr_id', None)
        qr_from_table =  #lookup

        new_box = Stock.create(
            # box_id=box_creation_input.get('box_id'),
            product_id=box_creation_input.get('product_id', None), #lookup
            size_id=box_creation_input.get('size_id', None), #lookup
            items=box_creation_input.get('items', None),
            location_id=box_creation_input.get('location_id', None), #lookup
            comments=box_creation_input.get('comments', None),
            # for now, this will store the hash if the ID is not available
            # We can store the ID once we can create new QR codes
            qr_id=,
            created=today,
            # created_by=box_creation_input.get('created_by', None),
            # box_state_id=box_creation_input.get('box_state_id', None)  #lookup
            )
        return new_box

    @staticmethod
    def get_box(box_id):
        box = Stock.select().where(Stock.box_id == box_id).get()
        return box


class Person(db.Model):
# id as an integer is the primary key
    camp_id = IntegerField()
    firstname = CharField()
    lastname = CharField()

    def __str__(self):
        return self.firstname


class Bases(db.Model):
    class Meta:
        table_name="Camps"

# id as an integer is the primary key
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
    def get_all_bases():
        return Bases.select().order_by(Bases.name)

    @staticmethod
    def get_bases_by_org_id(org_id):
        return Bases.select().where(Bases.organisation_id == org_id)

    @staticmethod
    def get_base(base_id):
        base = Bases.select().where(Bases.id == base_id).get()
        return base


class Usergroup_Base_Access(db.Model):
    class Meta:
        table_name="Cms_Usergroups_Camps"

    base_id = IntegerField(column_name="camp_id")
    usergroups_id = IntegerField(column_name="cms_usergroups_id")

    class Meta:
        # Cms_Usergroups_Camps has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("base_id", "usergroups_id")

    def __str__(self):
        return self.name

    @staticmethod
    def get_base_id(usergroup_id):
        return Usergroup_Base_Access.select(Usergroup_Base_Access.base_id).where(
            Usergroup_Base_Access.usergroups_id == usergroup_id
        )


class Users(db.Model):
    class Meta:
        table_name="Cms_Users"

    # id as an integer is the primary key
    name = CharField(column_name="naam")
    email = CharField()
    usergroups_id = IntegerField(column_name="cms_usergroups_id")
    valid_firstday = DateField()
    valid_lastday = DateField()
    lastlogin = DateTimeField()
    lastaction = DateTimeField()

    def __str__(self):
        return self.name, self.organisation_id

    @staticmethod
    def get_all_users():
        return Users.select().order_by(Users.name)

    @staticmethod
    def get_user(email):
        user = Users.select().where(Users.email == email).get()
        bases = Cms_Usergroups_Camps.get_base_id(user.usergroups_id)
        # bases is a peewee ModelSelect (so, many objects).
        # convert to dict 1 at a time,
        # and pull the base_id from that dict, and put in a list
        user.base_id = [model_to_dict(item)["base_id"] for item in bases]

        return user
