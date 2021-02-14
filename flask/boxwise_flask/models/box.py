import uuid
from datetime import datetime

from boxwise_flask.db import db
from boxwise_flask.models.box_state import BoxState
from boxwise_flask.models.location import Location
from boxwise_flask.models.product import Product
from boxwise_flask.models.size import Size
from boxwise_flask.models.user import User
from peewee import (
    SQL,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    TextField,
)

from .qr_code import QRCode


class Box(db.Model):
    box_id = CharField(constraints=[SQL("DEFAULT ''")], index=True)
    box_state = ForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL("DEFAULT 1")],
        field="id",
        model=BoxState,
    )
    comments = TextField()
    created = DateTimeField(null=True)
    created_by = ForeignKeyField(
        column_name="created_by", field="id", model=User, null=True
    )
    deleted = DateTimeField(null=True, default=None)
    items = IntegerField()
    location = ForeignKeyField(column_name="location_id", field="id", model=Location)
    modified = DateTimeField(null=True)
    modified_by = ForeignKeyField(
        column_name="modified_by", field="id", model=User, null=True,
    )
    ordered = DateTimeField(null=True)
    ordered_by = ForeignKeyField(
        column_name="ordered_by", field="id", model=User, null=True,
    )
    picked = IntegerField(null=True)
    picked_by = ForeignKeyField(
        column_name="picked_by", field="id", model=User, null=True,
    )
    product = ForeignKeyField(column_name="product_id", field="id", model=Product)
    qr_code = ForeignKeyField(column_name="qr_id", field="id", model=QRCode, null=True)
    size = ForeignKeyField(column_name="size_id", field="id", model=Size, null=True)

    class Meta:
        table_name = "stock"

    def __unicode__(self):
        return self.box_id

    @staticmethod
    def create_box(box_creation_input):

        today = datetime.now()
        barcode = box_creation_input.get("qr_barcode", None)
        qr_id_from_table = QRCode.get_id_from_code(barcode)
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
            qr_id=qr_id_from_table,
            created=today,
            # this is consistently NULL in the table, do we want to change that?
            created_by=box_creation_input.get("created_by", None),
            box_state_id=1,  # always 1 for create?
        )
        return new_box

    @staticmethod
    def get_box(box_id):
        return Box.get(Box.box_id == box_id)

    @staticmethod
    def get_box_from_qr(qr_id):
        return Box.get(Box.qr_id == qr_id)
