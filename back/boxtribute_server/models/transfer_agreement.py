from peewee import SQL, DateTimeField, ForeignKeyField, IntegerField, TextField

from ..db import db
from .enums import TransferAgreementState
from .organisation import Organisation
from .user import User


class TransferAgreement(db.Model):
    source_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = ForeignKeyField(model=Organisation, on_update="CASCADE")
    state = IntegerField(
        constraints=[SQL(f"DEFAULT {TransferAgreementState.UNDER_REVIEW.value}")]
    )
    type = IntegerField()
    requested_on = DateTimeField(constraints=[SQL("DEFAULT CURRENT_TIMESTAMP")])
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
    valid_from = DateTimeField(constraints=[SQL("DEFAULT CURRENT_TIMESTAMP")])
    valid_until = DateTimeField(null=True)
    comment = TextField(constraints=[SQL("DEFAULT ''")])
