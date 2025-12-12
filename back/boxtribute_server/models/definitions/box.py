from peewee import SQL, CharField, DateTimeField, DecimalField, IntegerField, TextField

from ...db import db
from ...enums import BoxState as BoxStateEnum
from ..fields import UIntForeignKeyField, ZeroDateTimeField
from .box_state import BoxState
from .distribution_event import DistributionEvent
from .location import Location
from .product import Product
from .qr_code import QrCode
from .size import Size
from .unit import Unit
from .user import User


class Box(db.Model):  # type: ignore
    label_identifier = CharField(
        column_name="box_id",
        constraints=[SQL("DEFAULT ''")],
        max_length=11,
        # unique index created below
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
        on_delete="RESTRICT",
        object_id_name="state_id",
    )
    comment = TextField(column_name="comments", null=True)
    created_on = DateTimeField(column_name="created", null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    deleted_on = ZeroDateTimeField(column_name="deleted", null=True, default=None)
    distribution_event = UIntForeignKeyField(
        column_name="distro_event_id",
        field="id",
        model=DistributionEvent,
        null=True,
        on_update="CASCADE",
    )
    number_of_items = IntegerField(column_name="items", null=True)
    location = UIntForeignKeyField(
        column_name="location_id",
        field="id",
        model=Location,
        on_update="CASCADE",
        on_delete="RESTRICT",
    )
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
        object_id_name="last_modified_by_id",
    )
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        on_update="CASCADE",
        on_delete="RESTRICT",
    )
    qr_code = UIntForeignKeyField(
        column_name="qr_id",
        field="id",
        model=QrCode,
        null=True,
        on_update="CASCADE",
        on_delete="RESTRICT",
        object_id_name="qr_code_id",
        # unique index created below
    )
    size = UIntForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        null=True,
        on_update="CASCADE",
        on_delete="RESTRICT",
    )
    # The unit that the measure is displayed in the front-end in
    display_unit = UIntForeignKeyField(
        column_name="display_unit_id",
        field="id",
        model=Unit,
        null=True,
        on_update="CASCADE",
        on_delete="RESTRICT",
    )
    # The value of the measure in the dimension's base unit (kilogram for mass, liter
    # for volume). Multiply by unit.conversion_factor to obtain value in FE unit
    measure_value = DecimalField(
        max_digits=36,
        decimal_places=18,
        null=True,
    )

    class Meta:
        table_name = "stock"


# Create indices separately to specify index names (by default, peewee creates index
# names 'box_box_id' and 'box_qr_id' which do not match the original definitions from
# the MySQL table)
Box.add_index(SQL("CREATE UNIQUE INDEX box_id_unique ON stock (box_id)"))
Box.add_index(SQL("CREATE UNIQUE INDEX qr_id_unique ON stock (qr_id)"))
