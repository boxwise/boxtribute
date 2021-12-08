from peewee import (
    SQL,
    CharField,
    DateTimeField,
    ForeignKeyField,
    IntegerField,
    TextField,
)

from ..db import db
from .box_state import BoxState
from .location import Location
from .product import Product
from .qr_code import QrCode
from .size import Size
from .user import User


class Box(db.Model):
    label_identifier = CharField(
        column_name="box_id",
        constraints=[SQL("DEFAULT ''")],
        index=True,
        unique=True,
        max_length=11,
    )
    state = ForeignKeyField(
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
        model=QrCode,
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
