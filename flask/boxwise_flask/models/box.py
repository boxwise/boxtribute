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
    box_label_identifier = CharField(
        column_name="box_id",
        constraints=[SQL("DEFAULT ''")],
        index=True,
        unique=True,
        max_length=11,
    )
    box_state = ForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL("DEFAULT 1")],
        field="id",
        model=BoxState,
        on_update="CASCADE",
    )
    comment = TextField(column_name="comments")
    created_on = DateTimeField(column_name="created", null=True)
    created_by = ForeignKeyField(
        column_name="created_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    deleted = DateTimeField(null=True, default=None)
    items = IntegerField()
    location = ForeignKeyField(
        column_name="location_id",
        field="id",
        model=Location,
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = ForeignKeyField(
        column_name="modified_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    ordered = DateTimeField(null=True)
    ordered_by = ForeignKeyField(
        column_name="ordered_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    picked = IntegerField(null=True)
    picked_by = ForeignKeyField(
        column_name="picked_by",
        field="id",
        model=User,
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )
    product = ForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        on_update="CASCADE",
    )
    qr_code = ForeignKeyField(
        column_name="qr_id",
        field="id",
        model=QRCode,
        null=True,
        on_update="CASCADE",
        unique=True,
        constraints=[SQL("UNSIGNED")],
    )
    size = ForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        null=True,
        on_update="CASCADE",
        constraints=[SQL("UNSIGNED")],
    )

    class Meta:
        table_name = "stock"

    def __unicode__(self):
        return self.box_label_identifier

    @staticmethod
    def get_box(box_id):
        return Box.get(Box.box_label_identifier == box_id)
