from peewee import SQL, CharField, DateTimeField, IntegerField, TextField

from ...db import db
from ...enums import BoxState as BoxStateEnum
from ..fields import UIntForeignKeyField
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
    # On application level, the BoxState IntEnum is used. Its members behave like
    # integers in comparisons, and when put into int(). Since peewee does an
    # int-coversion when assigning a value to a FK field, it's possible to do
    #   box.state = BoxState.InStock     (without .value)
    # When comparing the value, use the ID of the FK field directly, as in
    #   box.state_id == Box.state.Lost   (without .value)
    state = UIntForeignKeyField(
        column_name="box_state_id",
        constraints=[SQL(f"DEFAULT {BoxStateEnum.InStock.value}")],
        field="id",
        model=BoxState,
        on_update="CASCADE",
        object_id_name="state_id",
    )
    comment = TextField(column_name="comments")
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted = DateTimeField(null=True, default=None)
    items = IntegerField()
    location = UIntForeignKeyField(
        column_name="location_id",
        field="id",
        model=Location,
        on_update="CASCADE",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    ordered = DateTimeField(null=True)
    ordered_by = UIntForeignKeyField(
        model=User,
        column_name="ordered_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    picked = IntegerField(null=True)
    picked_by = UIntForeignKeyField(
        model=User,
        column_name="picked_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        on_update="CASCADE",
    )
    qr_code = UIntForeignKeyField(
        column_name="qr_id",
        field="id",
        model=QrCode,
        null=True,
        on_update="CASCADE",
        unique=True,
    )
    size = UIntForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        null=True,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "stock"
