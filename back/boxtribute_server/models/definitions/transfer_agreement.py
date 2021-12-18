from peewee import SQL, DateTimeField, TextField

from ...db import db
from ...enums import TransferAgreementState, TransferAgreementType
from ..fields import EnumCharField, UIntForeignKeyField
from ..utils import utcnow
from .organisation import Organisation
from .user import User


class TransferAgreement(db.Model):
    source_organisation = UIntForeignKeyField(model=Organisation, on_update="CASCADE")
    target_organisation = UIntForeignKeyField(model=Organisation, on_update="CASCADE")
    state = EnumCharField(
        choices=TransferAgreementState,
        constraints=[SQL(f"DEFAULT '{TransferAgreementState.UnderReview.name}'")],
        default=TransferAgreementState.UnderReview,
    )
    type = EnumCharField(choices=TransferAgreementType)
    requested_on = DateTimeField(default=utcnow)
    requested_by = UIntForeignKeyField(
        model=User,
        column_name="requested_by",
        field="id",
        on_update="CASCADE",
    )
    accepted_on = DateTimeField(null=True)
    accepted_by = UIntForeignKeyField(
        model=User,
        column_name="accepted_by",
        field="id",
        on_update="CASCADE",
        on_delete="SET NULL",
        null=True,
    )
    terminated_on = DateTimeField(null=True)
    terminated_by = UIntForeignKeyField(
        model=User,
        column_name="terminated_by",
        field="id",
        on_update="CASCADE",
        on_delete="SET NULL",
        null=True,
    )
    valid_from = DateTimeField(default=utcnow)
    valid_until = DateTimeField(null=True)
    comment = TextField(constraints=[SQL("DEFAULT ''")], default="")
