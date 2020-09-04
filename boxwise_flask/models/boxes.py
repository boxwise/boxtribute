from peewee import CharField, DateField, DateTimeField, IntegerField
from playhouse.shortcuts import model_to_dict
import time
from datetime import date

from ..db import db
from .qr import Qrs


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
        qr_hash = box_creation_input.get('qr_barcode', None)
        qr_from_table =  Qrs.get_qr(barcode)

        new_box = Stock.create(
            # box_id primary
            product_id=box_creation_input.get('product_id', None), #lookup
            size_id=box_creation_input.get('size_id', None), #lookup
            items=box_creation_input.get('items', None),
            location_id=box_creation_input.get('location_id', None), #lookup
            comments=box_creation_input.get('comments', None),
            # for now, this will store the hash if the ID is not available
            # We can store the ID once we can create new QR codes
            qr_id=qr_from_table
            created=today,
            # created_by=box_creation_input.get('created_by', None),
            box_state_id= 1  #always 1 for create?
            )
        return new_box

    @staticmethod
    def get_box(box_id):
        box = Stock.select().where(Stock.box_id == box_id).get()
        return box

