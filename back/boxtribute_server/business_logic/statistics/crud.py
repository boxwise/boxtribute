from datetime import date

from peewee import SQL, fn

from ...db import db
from ...enums import HumanGender, ProductGender
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.product import Product
from ...models.definitions.product_category import ProductCategory


def compute_beneficiary_demographics(base_ids=None):
    """For each combination of age, gender, and day-truncated date count the number of
    beneficiaries in the bases with specified IDs (default: all bases) and return
    results as list.
    The 'age' dimensions actually represents a range of ages (e.g. 0-5, 5-10, etc.)
    """
    bin_width = 5
    gender = fn.IF(Beneficiary.gender == "", "D", Beneficiary.gender)
    created_on = db.database.truncate_date("day", Beneficiary.created_on)
    age = fn.FLOOR((date.today().year - Beneficiary.date_of_birth.year) / bin_width)

    conditions = [Beneficiary.deleted.is_null()]
    if base_ids is not None:
        conditions.append(Beneficiary.base << base_ids)

    demographics = (
        Beneficiary.select(
            gender.alias("gender"),
            created_on.alias("created_on"),
            age.alias("age"),
            fn.COUNT(Beneficiary.id).alias("count"),
        )
        .where(*conditions)
        .group_by(SQL("gender"), SQL("age"), SQL("created_on"))
        .dicts()
    )

    # Conversions for GraphQL interface
    for row in demographics:
        row["gender"] = HumanGender(row["gender"])
        row["created_on"] = row["created_on"].date()

    return demographics


def compute_created_boxes():
    """For each combination of product ID, category ID, gender, and day-truncated
    creation date count the number of created boxes, and the contained items.
    Return fact and dimension tables in the result.
    """
    facts = (
        DbChangeHistory.select(
            Product.id.alias("product_id"),
            Product.gender.alias("gender"),
            ProductCategory.id.alias("category_id"),
            DbChangeHistory.change_date.alias("created_on"),
            fn.COUNT(Box.id).alias("boxes_count"),
        )
        .join(Box, on=(DbChangeHistory.record_id == Box.id))
        .join(Product)
        .join(ProductCategory)
        .where(
            DbChangeHistory.table_name == "stock",
            DbChangeHistory.changes == "Record created",
        )
        .group_by(
            SQL("product_id"), SQL("category_id"), SQL("gender"), SQL("created_on")
        )
        .dicts()
    )

    # Conversions for GraphQL interface
    for row in facts:
        row["gender"] = ProductGender(row["gender"])
        row["created_on"] = row["created_on"].date()

    return facts
