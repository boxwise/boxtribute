from peewee import SQL, DateTimeField, TextField

from ..db import db
from . import UIntDeferredForeignKey, UIntForeignKeyField, utcnow
from .enums import EnumCharField, TransferAgreementState, TransferAgreementType
from .organisation import Organisation


class TransferAgreement(db.Model):
    source_organisation = UIntForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = UIntForeignKeyField(model=Organisation, on_update="CASCADE")
    state = EnumCharField(
        choices=TransferAgreementState,
        constraints=[SQL(f"DEFAULT '{TransferAgreementState.UNDER_REVIEW.name}'")],
    )
    type = EnumCharField(choices=TransferAgreementType)
    requested_on = DateTimeField(default=utcnow)
    requested_by = UIntDeferredForeignKey(
        "User",
        column_name="requested_by",
        field="id",
        on_update="CASCADE",
        on_delete="SET NULL",
    )
    accepted_on = DateTimeField(null=True)
    accepted_by = UIntDeferredForeignKey(
        "User",
        on_update="CASCADE",
        on_delete="SET NULL",
        null=True,
    )
    terminated_on = DateTimeField(null=True)
    terminated_by = UIntDeferredForeignKey(
        "User",
        on_update="CASCADE",
        on_delete="SET NULL",
        null=True,
    )
    valid_from = DateTimeField(default=utcnow)
    valid_until = DateTimeField(null=True)
    comment = TextField(constraints=[SQL("DEFAULT ''")])
