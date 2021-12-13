from ...db import db
from ..fields import UIntForeignKeyField
from .base import Base
from .transfer_agreement import TransferAgreement


class TransferAgreementDetail(db.Model):
    transfer_agreement = UIntForeignKeyField(
        model=TransferAgreement, on_update="CASCADE"
    )
    source_base = UIntForeignKeyField(model=Base, null=True, on_update="CASCADE")
    target_base = UIntForeignKeyField(model=Base, null=True, on_update="CASCADE")
