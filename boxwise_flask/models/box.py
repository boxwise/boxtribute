import uuid
from datetime import date

from peewee import CharField, DateTimeField, IntegerField

from ..db import db
from .qr import Qr


class Box(db.Model):
    class Meta:
        table_name = "Stock"

    box_id = CharField()
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
        barcode = box_creation_input.get("qr_barcode", None)
        qr_from_table = Qr.get_qr(barcode)
        box_uuid = uuid.uuid4()
        box_short_uuid = str(box_uuid)[
            :11
        ]  # the table is truncating a full uuid to 11 chars, so do it preemptively

        new_box = Box.create(
            # surprisingly not primary key, unique non-sequential identifier for a box
            box_id=box_short_uuid,
            product_id=box_creation_input.get(
                "product_id", None
            ),  # will become a fancy dropdown on the FE
            size_id=box_creation_input.get(
                "size_id", None
            ),  # will be tied to the product_id lookup somehow
            items=box_creation_input.get("items", None),
            location_id=box_creation_input.get(
                "location_id", None
            ),  # based on the user's allowed bases
            comments=box_creation_input.get("comments", None),
            qr_id=qr_from_table,
            created=today,
            # this is consistently NULL in the table, do we want to change that?
            created_by=None,
            box_state_id=1,  # always 1 for create?
        )
        return new_box

    @staticmethod
    def get_box(box_id):
        box = Box.select().where(Box.box_id == box_id).get()
        return box
