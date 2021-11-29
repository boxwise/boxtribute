from peewee import SQL, ForeignKeyField, IntegerField

from ..db import db
from .enums import TransferAgreementState
from .organisation import Organisation


class TransferAgreement(db.Model):
    source_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    state = IntegerField(
        constraints=[SQL(f"DEFAULT {TransferAgreementState.UNDER_REVIEW.value}")]
    )
    type = IntegerField()
