from peewee import DateTimeField

from ...db import db
from ..fields import UIntDeferredForeignKey, UIntForeignKeyField
from ..utils import utcnow
from .box import Box
from .location import Location
from .product import Product
from .shipment import Shipment


class ShipmentDetail(db.Model):
    shipment = UIntForeignKeyField(model=Shipment, on_update="CASCADE")
    box = UIntForeignKeyField(model=Box, on_update="CASCADE")
    source_product = UIntForeignKeyField(model=Product, on_update="CASCADE")
    target_product = UIntForeignKeyField(model=Product, on_update="CASCADE", null=True)
    source_location = UIntForeignKeyField(model=Location, on_update="CASCADE")
    target_location = UIntForeignKeyField(
        model=Location, on_update="CASCADE", null=True
    )
    created_on = DateTimeField(default=utcnow)
    created_by = UIntDeferredForeignKey(
        "User", on_update="CASCADE", on_delete="SET NULL"
    )
    deleted_on = DateTimeField(null=True)
    deleted_by = UIntDeferredForeignKey(
        "User", on_update="CASCADE", on_delete="SET NULL", null=True
    )
