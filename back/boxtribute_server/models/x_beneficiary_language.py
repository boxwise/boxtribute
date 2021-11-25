from peewee import ForeignKeyField

from ..db import db
from .beneficiary import Beneficiary
from .language import Language


class XBeneficiaryLanguage(db.Model):
    language = ForeignKeyField(
        column_name="language_id",
        field="id",
        model=Language,
        on_update="CASCADE",
        on_delete="CASCADE",
    )
    beneficiary = ForeignKeyField(
        column_name="people_id",
        field="id",
        model=Beneficiary,
        null=True,
        on_update="CASCADE",
        on_delete="CASCADE",
    )

    class Meta:
        table_name = "x_people_languages"
        indexes = ((("beneficiary", "language"), True),)
        primary_key = False
