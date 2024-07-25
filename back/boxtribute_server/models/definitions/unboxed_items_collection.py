from peewee import DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from .distribution_event import DistributionEvent
from .location import Location
from .product import Product
from .size import Size
from .user import User


class UnboxedItemsCollection(db.Model):  # type: ignore
    created_on = DateTimeField(null=True)
    created_by = UIntForeignKeyField(
        model=User,
        column_name="created_by",
        field="id",
        null=True,
        on_delete="SET NULL",
        on_update="CASCADE",
    )
    modified_on = DateTimeField(null=True)
    distribution_event = UIntForeignKeyField(
        column_name="distro_event_id",
        field="id",
        model=DistributionEvent,
        null=True,
        on_update="CASCADE",
    )
    number_of_items = IntegerField(null=False, default=0)

    # TODO: suggest to remove the relation from UnboxedItemCollection to Location again
    # It's most likely only requried to have them for DistributionEvents (since they are
    # kind of transient and should only exist in the Mobile Distro Context)
    # TODO: If we decide to do that, also ensure that the field (FK to location) is
    # removed again in the Database (DropApp migrations)

    location = UIntForeignKeyField(
        column_name="location_id",
        field="id",
        model=Location,
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
        table_name = "distro_events_unboxed_item_collections"
