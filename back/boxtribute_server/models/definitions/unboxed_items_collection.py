from boxtribute_server.models.definitions.distribution_event import DistributionEvent
from peewee import DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from .location import Location
from .product import Product
from .size import Size
from .user import User


class UnboxedItemsCollection(db.Model):
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
    last_modified_on = DateTimeField(column_name="modified", null=True)
    last_modified_by = UIntForeignKeyField(
        model=User,
        column_name="modified_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    items = IntegerField(null=False, default=0)
    location = UIntForeignKeyField(
        column_name="location_id",
        field="id",
        model=Location,
        on_update="CASCADE",
    )
    distribution_event = UIntForeignKeyField(
        column_name="distribution_event_id",
        field="id",
        model=DistributionEvent,
        null=True,
        on_update="CASCADE",
    )
    product = UIntForeignKeyField(
        column_name="product_id",
        field="id",
        model=Product,
        on_update="CASCADE",
    )
    size = UIntForeignKeyField(
        column_name="size_id",
        field="id",
        model=Size,
        on_update="CASCADE",
    )

    class Meta:
        table_name = "unboxed_items_collection"
