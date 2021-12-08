from peewee import SQL, DateTimeField, ForeignKeyField

from ..db import db
from .base import Base
from .enums import EnumCharField, ShipmentState
from .transfer_agreement import TransferAgreement
from .user import User


class Shipment(db.Model):
    source_base = ForeignKeyField(model=Base, on_update="CASCADE")
    target_base = ForeignKeyField(model=Base, on_update="CASCADE")
    transfer_agreement = ForeignKeyField(model=TransferAgreement, on_update="CASCADE")
    state = EnumCharField(
        constraints=[SQL(f"DEFAULT {ShipmentState.PREPARING.name}")],
        choices=ShipmentState,
    )
    started_on = DateTimeField(constraints=[SQL("DEFAULT UTC_TIMESTAMP")])
    started_by = ForeignKeyField(model=User, on_update="CASCADE", on_delete="SET NULL")
    canceled_on = DateTimeField(null=True)
    canceled_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    sent_on = DateTimeField(null=True)
    sent_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    completed_on = DateTimeField(null=True)
    completed_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
