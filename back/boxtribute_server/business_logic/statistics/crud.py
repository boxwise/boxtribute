from datetime import date

from peewee import JOIN, SQL, fn

from ...db import db
from ...enums import BoxState, HumanGender, TaggableObjectType
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.product import Product
from ...models.definitions.product_category import ProductCategory
from ...models.definitions.size import Size
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.utils import convert_ids


def _generate_dimensions(*names, facts):
    """Return a dictionary holding information (ID, name) about dimensions with
    specified names.
    """
    dimensions = {}

    if "product" in names:
        product_ids = {f["product_id"] for f in facts}
        dimensions["product"] = (
            Product.select(Product.id, Product.name)
            .where(Product.id << product_ids)
            .dicts()
        )

    if "category" in names:
        dimensions["category"] = ProductCategory.select(
            ProductCategory.id, ProductCategory.name
        ).dicts()

    if "tag" in names:
        tag_ids = {t for f in facts for t in f["tag_ids"]}
        dimensions["tag"] = (
            Tag.select(Tag.id, Tag.name).where(Tag.id << tag_ids).dicts()
        )

    if "size" in names:
        size_ids = {f["size_id"] for f in facts}
        dimensions["size"] = (
            Size.select(Size.id, Size.label.alias("name"))
            .where(Size.id << size_ids)
            .dicts()
        )

    return dimensions


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

    dimensions = _generate_dimensions("tag", facts=demographics)
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

    dimensions = _generate_dimensions("category", "product", facts=facts)
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

    dimensions = _generate_dimensions("category", "product", facts=facts)
    return {"facts": facts, "dimensions": dimensions}


def compute_top_products_donated(base_id):
    """Return list of most-donated products with rank included, grouped by distribution
    date, creation date, size, and product category.
    """
    selection = (
        DbChangeHistory.select(
            Box.created_on.alias("created_on"),
            DbChangeHistory.change_date.alias("distributed_on"),
            Box.size.alias("size_id"),
            Box.product.alias("product_id"),
            Product.category.alias("category_id"),
            fn.SUM(Box.number_of_items).alias("items_count"),
        )
        .join(
            Box,
            on=(
                (DbChangeHistory.record_id == Box.id)
                & (DbChangeHistory.table_name == Box._meta.table_name)
                & (DbChangeHistory.changes == Box.state.column_name)
                & (DbChangeHistory.from_int == BoxState.InStock)
                & (DbChangeHistory.to_int == BoxState.Donated)
            ),
        )
        .join(
            Product,
            on=((Box.product == Product.id) & (Product.base == base_id)),
        )
    )
    facts = (
        selection.group_by(
            SQL("created_on"),
            SQL("distributed_on"),
            SQL("size_id"),
            SQL("product_id"),
            SQL("category_id"),
        )
        .order_by(SQL("items_count").desc())
        .dicts()
    )

    # Data transformations
    for rank, row in enumerate(facts, start=1):
        row["rank"] = rank
        row["distributed_on"] = row["distributed_on"].date()
        row["created_on"] = row["created_on"].date()

    dimensions = _generate_dimensions("category", "product", "size", facts=facts)
    return {"facts": facts, "dimensions": dimensions}
