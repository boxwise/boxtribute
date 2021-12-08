from peewee import SQL, DateTimeField, ForeignKeyField

from ..db import db
from .box import Box
from .location import Location
from .product import Product
from .shipment import Shipment
from .user import User


class ShipmentDetail(db.Model):
    shipment = ForeignKeyField(model=Shipment, on_update="CASCADE")
    box = ForeignKeyField(model=Box, on_update="CASCADE")
    source_product = ForeignKeyField(model=Product, on_update="CASCADE")
    target_product = ForeignKeyField(model=Product, on_update="CASCADE", null=True)
    source_location = ForeignKeyField(model=Location, on_update="CASCADE")
    target_location = ForeignKeyField(model=Location, on_update="CASCADE", null=True)
    created_on = DateTimeField(constraints=[SQL("DEFAULT UTC_TIMESTAMP")])
    created_by = ForeignKeyField(model=User, on_update="CASCADE", on_delete="SET NULL")
    deleted_on = DateTimeField(null=True)
    deleted_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
