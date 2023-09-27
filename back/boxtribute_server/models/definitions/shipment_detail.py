from peewee import DateTimeField, IntegerField

from ...db import db
from ..fields import UIntForeignKeyField
from ..utils import utcnow
from .box import Box
from .location import Location
from .product import Product
from .shipment import Shipment
from .size import Size
from .user import User


class ShipmentDetail(db.Model):
    shipment = UIntForeignKeyField(model=Shipment, on_update="CASCADE")
    box = UIntForeignKeyField(model=Box, on_update="CASCADE")
    source_product = UIntForeignKeyField(model=Product, on_update="CASCADE")
    target_product = UIntForeignKeyField(model=Product, on_update="CASCADE", null=True)
    source_location = UIntForeignKeyField(model=Location, on_update="CASCADE")
    target_location = UIntForeignKeyField(
        model=Location, on_update="CASCADE", null=True
    )
    source_size = UIntForeignKeyField(model=Size, on_update="CASCADE")
    target_size = UIntForeignKeyField(model=Size, on_update="CASCADE", null=True)
    source_quantity = IntegerField()
    target_quantity = IntegerField(null=True)
    created_on = DateTimeField(default=utcnow)
    created_by = UIntForeignKeyField(model=User, on_update="CASCADE")
    removed_on = DateTimeField(null=True)
    removed_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    lost_on = DateTimeField(null=True)
    lost_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    received_on = DateTimeField(null=True)
    received_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )

    class Meta:
        legacy_table_names = False
