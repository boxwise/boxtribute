"""Model definitions for database"""
from peewee import CharField, CompositeKey, DateField, DateTimeField, IntegerField
from playhouse.shortcuts import model_to_dict

from .app import db


class Stock(db.Model):
    # INSERT INTO stock (
    #   box_id, product_id, size_id, items, location_id,
    #   comments, qr_id, created, created_by, box_state_id)
    # VALUES (
    #   :box_id, :product_id, :size_id, :items, :location_id, :comments,
    #   :qr_id, :created, :created_by, :box_state_id)

    id = IntegerField()
    box_id = IntegerField()
    product_id = IntegerField()
    size_id = IntegerField()
    items = IntegerField()
    location_id = IntegerField()
    comments = CharField()
    qr_id = IntegerField()
    created = CharField()
    created_by = CharField()
    box_state_id = IntegerField()

    def __unicode__(self):
        return self.box_id

    @staticmethod
    def create_box(box):
        new_box = Stock.create(
            box_id=box.get('box_id'),
            product_id=box.get('product_id', None),
            size_id=box.get('size_id', None),
            items=box.get('items', None),
            location_id=box.get('location_id', None),
            comments=box.get('comments', None),
            qr_id=box.get('qr_id', None),
            created=box.get('created', None),
            created_by=box.get('created_by', None),
            box_state_id=box.get('box_state_id', None)
            )
        return new_box

    @staticmethod
    def get_box(box_id):
        box = Stock.select().where(Stock.box_id == box_id).get()
        return box


class Camps(db.Model):
    id = CharField()
    organisation_id = CharField()
    name = CharField()
    currencyname = CharField()

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_all_camps():
        return Camps.select().order_by(Camps.name)

    @staticmethod
    def get_camp(camp_id):
        camp = Camps.select().where(Camps.id == camp_id).get()
        return camp


class Cms_Usergroups_Camps(db.Model):
    camp_id = CharField()
    cms_usergroups_id = CharField()

    class Meta:
        # Cms_Usergroups_Camps has no primary key,
        # so we construct a composite to use as one here
        primary_key = CompositeKey("camp_id", "cms_usergroups_id")

    def __unicode__(self):
        return self.name

    @staticmethod
    def get_camp_id(usergroup_id):
        return Cms_Usergroups_Camps.select(Cms_Usergroups_Camps.camp_id).where(
            Cms_Usergroups_Camps.cms_usergroups_id == usergroup_id
        )


class Cms_Users(db.Model):
    id = CharField()
    name = CharField(column_name="naam")
    email = CharField()
    cms_usergroups_id = CharField()
    valid_firstday = DateField()
    valid_lastday = DateField()
    lastlogin = DateTimeField()
    lastaction = DateTimeField()

    def __unicode__(self):
        return self.name

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
