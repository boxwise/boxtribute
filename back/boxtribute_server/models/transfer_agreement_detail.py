from peewee import SQL, ForeignKeyField

from ..db import db
from .base import Base
from .transfer_agreement import TransferAgreement


class TransferAgreementDetail(db.Model):
    transfer_agreement = ForeignKeyField(model=TransferAgreement, on_update="CASCADE")
    source_base = ForeignKeyField(
        model=Base, null=True, on_update="CASCADE", constraints=[SQL("UNSIGNED")]
    )
    target_base = ForeignKeyField(
        model=Base, null=True, on_update="CASCADE", constraints=[SQL("UNSIGNED")]
    )
