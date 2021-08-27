from boxwise_flask.db import db
from boxwise_flask.models.beneficiary import Beneficiary
from boxwise_flask.models.language import Language
from peewee import ForeignKeyField


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
        indexes = ((("people", "language"), True),)
        primary_key = False
