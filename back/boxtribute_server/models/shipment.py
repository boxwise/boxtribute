from peewee import SQL, DateTimeField

from ..db import db
from . import UIntDeferredForeignKey, UIntForeignKeyField, utcnow
from .base import Base
from .enums import EnumCharField, ShipmentState
from .transfer_agreement import TransferAgreement


class Shipment(db.Model):
    source_base = UIntForeignKeyField(model=Base, on_update="CASCADE")
    target_base = UIntForeignKeyField(model=Base, on_update="CASCADE")
    transfer_agreement = UIntForeignKeyField(
        model=TransferAgreement, on_update="CASCADE"
    )
    state = EnumCharField(
        constraints=[SQL(f"DEFAULT '{ShipmentState.PREPARING.name}'")],
        choices=ShipmentState,
    )
    started_on = DateTimeField(default=utcnow)
    started_by = UIntDeferredForeignKey(
        "User",
        column_name="started_by",
        field="id",
        on_update="CASCADE",
        on_delete="SET NULL",
    )
    canceled_on = DateTimeField(null=True)
    canceled_by = UIntDeferredForeignKey(
        "User", on_update="CASCADE", on_delete="SET NULL", null=True
    )
    sent_on = DateTimeField(null=True)
    sent_by = UIntDeferredForeignKey(
        "User", on_update="CASCADE", on_delete="SET NULL", null=True
    )
    completed_on = DateTimeField(null=True)
    completed_by = UIntDeferredForeignKey(
        "User", on_update="CASCADE", on_delete="SET NULL", null=True
    )
