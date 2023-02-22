from peewee import DateTimeField

from ...db import db
from ...enums import ShipmentState
from ..fields import EnumCharField, UIntForeignKeyField
from ..utils import utcnow
from .base import Base
from .transfer_agreement import TransferAgreement
from .user import User


class Shipment(db.Model):
    source_base = UIntForeignKeyField(model=Base, on_update="CASCADE")
    target_base = UIntForeignKeyField(model=Base, on_update="CASCADE")
    transfer_agreement = UIntForeignKeyField(
        model=TransferAgreement, on_update="CASCADE"
    )
    state = EnumCharField(
        choices=ShipmentState,
        default=ShipmentState.Preparing,
    )
    started_on = DateTimeField(default=utcnow)
    started_by = UIntForeignKeyField(
        model=User,
        on_update="CASCADE",
    )
    canceled_on = DateTimeField(null=True)
    canceled_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    sent_on = DateTimeField(null=True)
    sent_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    receiving_started_on = DateTimeField(null=True)
    receiving_started_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    completed_on = DateTimeField(null=True)
    completed_by = UIntForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )

    class Meta:
        legacy_table_names = False
