from boxtribute_server.enums import DistributionEventTrackingFlowDirection
from peewee import DateTimeField, IntegerField

from ...db import db
from ..fields import EnumCharField, UIntForeignKeyField
from .distribution_event_tracking_group import DistributionEventTrackingGroup
from .product import Product
from .size import Size


class DistributionEventTrackingGroup(db.Model):
    distro_event_tracking_group = UIntForeignKeyField(
        column_name="distro_event_id",
        field="id",
        model=DistributionEventTrackingGroup,
        null=True,
        on_update="CASCADE",
    )
    date = DateTimeField()
    flow_direction = EnumCharField(choices=DistributionEventTrackingFlowDirection)
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
    number_of_items = IntegerField(column_name="items", null=True)

    class Meta:
        table_name = "distro_events_tracking_logs"
