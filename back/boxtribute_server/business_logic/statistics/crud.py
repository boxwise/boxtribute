from datetime import date

from peewee import JOIN, SQL, fn

from ...db import db
from ...enums import HumanGender, TaggableObjectType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.location import Location
from ...models.definitions.product import Product
from ...models.definitions.product_category import ProductCategory
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.utils import convert_ids


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
    tag_ids = fn.GROUP_CONCAT(TagsRelation.tag).python_value(convert_ids)

    conditions = [Beneficiary.deleted.is_null()]
    if base_ids is not None:
        conditions.append(Beneficiary.base << base_ids)

    demographics = (
        Beneficiary.select(
            gender.alias("gender"),
            created_on.alias("created_on"),
            age.alias("age"),
            tag_ids.alias("tag_ids"),
            fn.COUNT(Beneficiary.id.distinct()).alias("count"),
        )
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            on=(
                (TagsRelation.object_id == Beneficiary.id)
                & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
            ),
        )
        .where(*conditions)
        .group_by(SQL("gender"), SQL("age"), SQL("created_on"))
        .dicts()
    )

    # Conversions for GraphQL interface
    for row in demographics:
        row["gender"] = HumanGender(row["gender"])
        row["created_on"] = row["created_on"].date()

    selected_tag_ids = {t for t in row["tag_ids"] for row in demographics}
    dimensions = {
        "tag": Tag.select(Tag.id, Tag.name).where(Tag.id << selected_tag_ids).dicts()
    }

    return {"facts": demographics, "dimensions": dimensions}


def compute_created_boxes(base_id=None):
    """For each combination of product ID, category ID, gender, and day-truncated
    creation date count the number of created boxes, and the contained items, in the
    base with the specified ID.
    Return fact and dimension tables in the result.
    """
    selection = Box.select(
        Box.created_on.alias("created_on"),
        Product.id.alias("product_id"),
        Product.gender.alias("gender"),
        Product.category.alias("category_id"),
        fn.COUNT(Box.id).alias("boxes_count"),
        fn.SUM(Box.number_of_items).alias("items_count"),
    ).join(Product)

    if base_id is not None:
        selection = selection.join(Location, src=Box).where(Location.base == base_id)

    facts = selection.group_by(
        SQL("product_id"), SQL("category_id"), SQL("gender"), SQL("created_on")
    ).dicts()

    # Conversions for GraphQL interface
    for row in facts:
        if row["created_on"] is not None:
            row["created_on"] = row["created_on"].date()

    products_ids = {f["product_id"] for f in facts}
    dimensions = {
        "product": list(
            Product.select(Product.id, Product.name)
            .where(Product.id << products_ids)
            .dicts()
        ),
        "category": list(
            ProductCategory.select(ProductCategory.id, ProductCategory.name).dicts()
        ),
    }

    return {"facts": facts, "dimensions": dimensions}


def compute_top_products_checked_out(base_id):
    """Return list of most-checked-out products (i.e. highest count in transactions)
    with rank included, grouped by distribution date and product category.
    """
    selection = Transaction.select(
        Transaction.created_on.alias("distributed_on"),
        Transaction.product.alias("product_id"),
        Product.category.alias("category_id"),
        fn.SUM(Transaction.count).alias("items_count"),
    ).join(
        Product, on=((Product.base == base_id) & (Transaction.product == Product.id))
    )
    facts = (
        selection.group_by(SQL("product_id"), SQL("category_id"), SQL("distributed_on"))
        .order_by(SQL("items_count").desc())
        .dicts()
    )

    # Data transformations
    for rank, row in enumerate(facts, start=1):
        row["rank"] = rank
        row["distributed_on"] = row["distributed_on"].date()

    product_ids = {f["product_id"] for f in facts}
    dimensions = {
        "product": list(
            Product.select(Product.id, Product.name)
            .where(Product.id << product_ids)
            .dicts()
        ),
        "category": list(
            ProductCategory.select(ProductCategory.id, ProductCategory.name).dicts()
        ),
    }
    return {"facts": facts, "dimensions": dimensions}
