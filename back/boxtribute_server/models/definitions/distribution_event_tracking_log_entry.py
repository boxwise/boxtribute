from peewee import DateTimeField, IntegerField

from ...db import db
from ...enums import DistributionEventTrackingFlowDirection
from ..fields import EnumCharField, UIntForeignKeyField
from .distribution_events_tracking_group import DistributionEventsTrackingGroup
from .product import Product
from .size import Size


class DistributionEventTrackingLogEntry(db.Model):  # type: ignore
    distro_event_tracking_group = UIntForeignKeyField(
        column_name="distro_event_tracking_group_id",
        field="id",
        model=DistributionEventsTrackingGroup,
        null=True,
        on_update="CASCADE",
    )
    date = DateTimeField()
    flow_direction = EnumCharField(
        choices=DistributionEventTrackingFlowDirection, null=False
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
    number_of_items = IntegerField(null=True)

    class Meta:
        table_name = "distro_events_tracking_logs"
