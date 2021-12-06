from peewee import SQL, DateTimeField, ForeignKeyField, TextField

from ..db import db
from .enums import EnumCharField, TransferAgreementState, TransferAgreementType
from .organisation import Organisation
from .user import User


class TransferAgreement(db.Model):
    source_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    state = EnumCharField(
        choices=TransferAgreementState,
        constraints=[SQL(f"DEFAULT {TransferAgreementState.UNDER_REVIEW.name}")],
    )
    type = EnumCharField(choices=TransferAgreementType)
    requested_on = DateTimeField(constraints=[SQL("DEFAULT UTC_TIMESTAMP")])
    requested_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL"
    )
    accepted_on = DateTimeField(null=True)
    accepted_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    terminated_on = DateTimeField(null=True)
    terminated_by = ForeignKeyField(
        model=User, on_update="CASCADE", on_delete="SET NULL", null=True
    )
    valid_from = DateTimeField(constraints=[SQL("DEFAULT UTC_TIMESTAMP")])
    valid_until = DateTimeField(null=True)
    comment = TextField(constraints=[SQL("DEFAULT ''")])
