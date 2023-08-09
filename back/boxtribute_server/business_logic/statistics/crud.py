from datetime import date

from peewee import SQL, fn

from ...db import db
from ...enums import HumanGender
from ...models.definitions.beneficiary import Beneficiary


def compute_beneficiary_demographics(base_ids):
    bin_width = 5
    gender = fn.IF(Beneficiary.gender == "", "D", Beneficiary.gender)
    created_on = db.database.truncate_date("day", Beneficiary.created_on)
    age = fn.FLOOR((date.today().year - Beneficiary.date_of_birth.year) / bin_width)

    demographics = (
        Beneficiary.select(
            gender.alias("gender"),
            created_on.alias("created_on"),
            age.alias("age"),
            fn.COUNT(Beneficiary.id).alias("count"),
        )
        .where(Beneficiary.deleted.is_null(), Beneficiary.base << base_ids)
        .group_by(SQL("gender"), SQL("age"), SQL("created_on"))
        .dicts()
    )

    # Conversions for GraphQL interface
    for row in demographics:
        row["gender"] = HumanGender(row["gender"])
        row["created_on"] = row["created_on"].date()

    return demographics
