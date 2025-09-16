import hashlib
import random
import string
from dataclasses import dataclass
from datetime import timedelta
from typing import Any

from peewee import JOIN, SQL, fn

from ...db import db
from ...enums import BoxState, TaggableObjectType, TargetType
from ...errors import InvalidDate
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.product import Product
from ...models.definitions.product_category import ProductCategory
from ...models.definitions.shareable_link import ShareableLink
from ...models.definitions.size import Size
from ...models.definitions.size_range import SizeRange
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.definitions.unit import Unit
from ...models.utils import compute_age, convert_ids, execute_sql, utcnow
from ...utils import in_ci_environment, in_production_environment
from .sql import MOVED_BOXES_QUERY


@dataclass(kw_only=True)
class DataCube:
    facts: list[dict[str, Any]]
    dimensions: list[dict[str, Any]]
    type: str  # Identical to GraphQL DataCube implementation type


def _validate_existing_base(base_id):
    """Raise a `peewee.DoesNotExist` exception if base with given ID does not exist in
    the database. This will be reported as a BAD_USER_INPUT error.
    """
    Base.select(Base.id).where(Base.id == base_id).get()


def _generate_dimensions(*names, target_type=None, facts):
    """Return a dictionary holding information (ID, name) about dimensions with
    specified names.
    If `target_type` is set, add a 'target' field containing information about a target
    with given type.
    """
    dimensions = {}

    if "product" in names:
        product_ids = {f["product_id"] for f in facts}
        dimensions["product"] = (
            Product.select(Product.id, Product.name, Product.gender)
            .where(Product.id << product_ids)
            .dicts()
        )

    if "dimension" in names:
        dimensions["dimension"] = (
            SizeRange.select(SizeRange.id, SizeRange.label.alias("name"))
            .where(SizeRange.id << [28, 29])
            .dicts()
        )

    if "category" in names:
        dimensions["category"] = ProductCategory.select(
            ProductCategory.id, ProductCategory.name
        ).dicts()

    if "tag" in names:
        tag_ids = {t for f in facts for t in f["tag_ids"]}
        dimensions["tag"] = (
            Tag.select(Tag.id, Tag.name, Tag.color).where(Tag.id << tag_ids).dicts()
        )

    if "size" in names:
        size_ids = {f["size_id"] for f in facts}
        dimensions["size"] = (
            Size.select(Size.id, Size.label.alias("name"))
            .where(Size.id << size_ids)
            .dicts()
        )

    if "location" in names:
        location_ids = {f["location_id"] for f in facts}
        dimensions["location"] = (
            Location.select(Location.id, Location.name)
            .where(Location.id << location_ids)
            .dicts()
        )

    if target_type is not None:
        target_ids = {
            f["target_id"] for f in facts if TargetType[f["target_type"]] == target_type
        }
        # Target ID and name are identical for now
        dimensions["target"] = [
            {"id": i, "name": i, "type": target_type} for i in target_ids
        ]

    return dimensions


def compute_beneficiary_demographics(base_id):
    """For each combination of age, gender, and day-truncated date count the number of
    beneficiaries in the bases with specified IDs (default: all bases) and return
    results as list.
    """
    _validate_existing_base(base_id)
    gender = SQL("IF(gender = '', 'D', gender)")
    created_on = Beneficiary.created_on.truncate("day")
    deleted_on = fn.IF(
        Beneficiary.deleted_on > 0, Beneficiary.deleted_on.truncate("day"), None
    )
    age = fn.IF(
        Beneficiary.date_of_birth > 0, compute_age(Beneficiary.date_of_birth), None
    )
    tag_ids = fn.GROUP_CONCAT(TagsRelation.tag)

    # Subquery to select distinct beneficiaries with associated tags
    beneficiaries = (
        Beneficiary.select(
            Beneficiary.id,
            gender.alias("gender"),
            fn.DATE(created_on).alias("created_on"),
            fn.DATE(deleted_on).alias("deleted_on"),
            age.alias("age"),
            tag_ids.alias("tag_ids"),
        )
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            on=(
                (TagsRelation.object_id == Beneficiary.id)
                & (TagsRelation.object_type == TaggableObjectType.Beneficiary)
                & (TagsRelation.deleted_on.is_null())
            ),
        )
        .where(Beneficiary.base == base_id)
        .group_by(Beneficiary.id)
    )
    facts = (
        Beneficiary.select(
            beneficiaries.c.gender,
            beneficiaries.c.created_on,
            beneficiaries.c.deleted_on,
            beneficiaries.c.age,
            beneficiaries.c.tag_ids,
            fn.COUNT(beneficiaries.c.id).alias("count"),
        )
        .from_(beneficiaries)
        .group_by(
            SQL("gender"),
            SQL("age"),
            SQL("created_on"),
            SQL("deleted_on"),
            SQL("tag_ids"),
        )
        .dicts()
        .execute()
    )

    for fact in facts:
        fact["tag_ids"] = sorted(convert_ids(fact["tag_ids"]))
    dimensions = _generate_dimensions("tag", facts=facts)
    return DataCube(
        facts=facts, dimensions=dimensions, type="BeneficiaryDemographicsData"
    )


def compute_created_boxes(base_id):
    """For each combination of product ID, category ID, gender, and day-truncated
    creation date count the number of created boxes, and the contained items, in the
    base with the specified ID.
    Return fact and dimension tables in the result.
    """
    _validate_existing_base(base_id)
    cte = (
        Location.select(Location.id).where(Location.base == base_id).cte("location_ids")
    )
    location_ids = cte.select(cte.c.id)
    created_on = Box.created_on.truncate("day")
    LocationHistory = DbChangeHistory.alias()
    ProductHistory = DbChangeHistory.alias()
    ItemsHistory = DbChangeHistory.alias()

    def oldest_rows(field):
        # Find the change with smallest ID (i.e. the oldest) corresponding to the given
        # field of the Box model
        HistoryAlias = DbChangeHistory.alias()
        return HistoryAlias.select(fn.MIN(HistoryAlias.id)).where(
            HistoryAlias.record_id == Box.id,
            HistoryAlias.table_name == Box._meta.table_name,
            HistoryAlias.changes == field.column_name,
        )

    # Select all boxes, that were in the given base at creation, and their initial
    # properties
    boxes = (
        Box.select(
            Box.id,
            created_on.alias("created_on"),
            fn.IFNULL(ItemsHistory.from_int, Box.number_of_items).alias("items"),
            fn.IFNULL(ProductHistory.from_int, Box.product).alias("product_id"),
        )
        .join(
            LocationHistory,
            JOIN.LEFT_OUTER,
            src=Box,
            on=(
                (LocationHistory.record_id == Box.id)
                & (LocationHistory.table_name == Box._meta.table_name)
                & (LocationHistory.changes == Box.location.column_name)
                & (LocationHistory.id == oldest_rows(Box.location))
            ),
        )
        .join(
            ProductHistory,
            JOIN.LEFT_OUTER,
            src=Box,
            on=(
                (ProductHistory.record_id == Box.id)
                & (ProductHistory.table_name == Box._meta.table_name)
                & (ProductHistory.changes == Box.product.column_name)
                & (ProductHistory.id == oldest_rows(Box.product))
            ),
        )
        .join(
            ItemsHistory,
            JOIN.LEFT_OUTER,
            src=Box,
            on=(
                (ItemsHistory.record_id == Box.id)
                & (ItemsHistory.table_name == Box._meta.table_name)
                & (ItemsHistory.changes == Box.number_of_items.column_name)
                & (ItemsHistory.id == oldest_rows(Box.number_of_items))
            ),
        )
        .where(
            Box.created_on.is_null(False),
            (LocationHistory.from_int << location_ids)
            | (LocationHistory.from_int.is_null() & (Box.location << location_ids)),
        )
    )

    # To properly handle boxes with multiple tags, use a two-step approach:
    # Step 1: Get each box once with its tags as a comma-separated string
    boxes_with_tags = (
        Box.select(
            boxes.c.created_on,
            boxes.c.id,
            boxes.c.items,
            boxes.c.product_id,
            fn.GROUP_CONCAT(TagsRelation.tag).alias("tag_ids"),
        )
        .from_(boxes)
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            on=(
                (TagsRelation.object_id == boxes.c.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
                & (TagsRelation.deleted_on.is_null())
            ),
        )
        .group_by(boxes.c.id)  # This ensures each box appears only once
        .alias("boxes_with_tags")
    )

    # Step 2: Aggregate boxes by dimensions
    facts = (
        Box.select(
            boxes_with_tags.c.created_on,
            fn.COUNT(boxes_with_tags.c.id).alias("boxes_count"),
            fn.SUM(boxes_with_tags.c.items).alias("items_count"),
            Product.id.alias("product_id"),
            Product.gender.alias("gender"),
            Product.category.alias("category_id"),
            boxes_with_tags.c.tag_ids,
        )
        .from_(boxes_with_tags)
        .join(
            Product,
            on=(boxes_with_tags.c.product_id == Product.id),
        )
        .group_by(
            SQL("product_id"),
            SQL("category_id"),
            SQL("gender"),
            SQL("created_on"),
            SQL("tag_ids"),
        )
        .with_cte(cte)
    ).dicts()

    for fact in facts:
        fact["tag_ids"] = sorted(convert_ids(fact["tag_ids"]))

    dimensions = _generate_dimensions("category", "product", "tag", facts=facts)
    return DataCube(facts=facts, dimensions=dimensions, type="CreatedBoxesData")


def compute_top_products_checked_out(base_id):
    """Return list of most-checked-out products (i.e. highest count in transactions)
    with rank included, grouped by distribution date and product category.
    """
    _validate_existing_base(base_id)
    selection = Transaction.select(
        fn.DATE(Transaction.created_on).alias("checked_out_on"),
        Transaction.product.alias("product_id"),
        Product.category.alias("category_id"),
        fn.SUM(Transaction.count).alias("items_count"),
        fn.RANK().over(order_by=[fn.SUM(Transaction.count).desc()]).alias("rank"),
    ).join(
        Product, on=((Product.base == base_id) & (Transaction.product == Product.id))
    )
    facts = selection.group_by(
        SQL("product_id"),
        SQL("category_id"),
        SQL("checked_out_on"),
    ).dicts()

    dimensions = _generate_dimensions("category", "product", facts=facts)
    dimensions["size"] = None
    return DataCube(
        facts=facts, dimensions=dimensions, type="TopProductsCheckedOutData"
    )


def compute_top_products_donated(base_id):
    """Return list of most-donated products with rank included, grouped by distribution
    date, creation date, size, and product category.
    """
    _validate_existing_base(base_id)
    selection = (
        DbChangeHistory.select(
            fn.DATE(Box.created_on).alias("created_on"),
            fn.DATE(DbChangeHistory.change_date).alias("donated_on"),
            Box.size.alias("size_id"),
            Box.product.alias("product_id"),
            Product.category.alias("category_id"),
            fn.SUM(Box.number_of_items).alias("items_count"),
            fn.RANK().over(order_by=[fn.SUM(Box.number_of_items).desc()]).alias("rank"),
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
    facts = selection.group_by(
        SQL("created_on"),
        SQL("donated_on"),
        SQL("size_id"),
        SQL("product_id"),
        SQL("category_id"),
    ).dicts()

    dimensions = _generate_dimensions("category", "product", "size", facts=facts)
    return DataCube(facts=facts, dimensions=dimensions, type="TopProductsDonatedData")


def compute_moved_boxes(base_id):
    """Count all boxes that were
    1. shipped to other bases from given base as source
    2. moved between the box states InStock and Donated within the given base
    3. marked as Lost or Scrap within the given base
    Results are grouped by date of movement, product category, product name, product
    gender, size ID, and target name (target types for the enumeration above are
    Shipment (1.), OutgoingLocation (2.), and BoxState (3.).

    Details for 2.:
    - boxes moved from state InStock to Donated are counted positively, incl. the
    contained items. For the opposite direction, they're counted negatively. Hence boxes
    that are moved back and forth are not counted into the statistics. Same for a box
    that has items taken out in a Donated location, and then is moved back.
    - in production, only data from 2023 and newer is taken into account. Previously
    boxes didn't have states assigned, instead box state was dictated by the type of
    location the box was stored in
    """
    _validate_existing_base(base_id)
    min_history_id = 1
    if in_production_environment() and not in_ci_environment():  # pragma: no cover
        # Earliest row ID in tables in 2023
        min_history_id = 1_324_559

    facts = execute_sql(
        base_id,
        min_history_id,
        TargetType.BoxState.name,
        TargetType.BoxState.name,
        TargetType.OutgoingLocation.name,
        TargetType.OutgoingLocation.name,
        TargetType.Shipment.name,
        base_id,
        TargetType.BoxState.name,
        base_id,
        database=db.replica or db.database,
        query=MOVED_BOXES_QUERY,
    )
    for fact in facts:
        fact["tag_ids"] = convert_ids(fact["tag_ids"])

    dimensions = _generate_dimensions("category", "size", "tag", facts=facts)
    dimensions["target"] = (
        _generate_dimensions(
            target_type=TargetType.OutgoingLocation,
            facts=facts,
        )["target"]
        + _generate_dimensions(
            target_type=TargetType.Shipment,
            facts=facts,
        )["target"]
        + _generate_dimensions(
            target_type=TargetType.BoxState,
            facts=facts,
        )["target"]
    )
    return DataCube(facts=facts, dimensions=dimensions, type="MovedBoxesData")


def compute_stock_overview(base_id, *, tag_ids=None):
    """Compute stock overview (number of boxes and number of contained items) for the
    given base. The result can be filtered by size, location, box state, product
    category, product name, and product gender.
    """
    _validate_existing_base(base_id)
    tag_filter = (TagsRelation.tag << tag_ids) if tag_ids is not None else True

    # Subquery to select distinct boxes with associated tags
    boxes = (
        Box.select(
            Box.id,
            Box.size.alias("size_id"),
            Box.location.alias("location_id"),
            Box.state.alias("box_state"),
            Box.product.alias("product_id"),
            # Round float to three significant digits
            fn.ROUND(
                Box.measure_value, 3 - fn.FLOOR(fn.LOG10(Box.measure_value) + 1)
            ).alias("absolute_measure_value"),
            Box.display_unit,
            Box.number_of_items.alias("number_of_items"),
            fn.GROUP_CONCAT(TagsRelation.tag).alias("tag_ids"),
        )
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            src=Box,
            on=(
                (TagsRelation.object_id == Box.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
                & (TagsRelation.deleted_on.is_null())
            ),
        )
        .where((~Box.deleted_on) | (Box.deleted_on.is_null()), tag_filter)
        .group_by(Box.id)
    )
    facts = (
        Box.select(
            boxes.c.size_id,
            boxes.c.location_id,
            boxes.c.box_state,
            Product.category.alias("category_id"),
            fn.TRIM(fn.LOWER(Product.name)).alias("product_name"),
            boxes.c.absolute_measure_value,
            Unit.dimension.alias("dimension_id"),
            Product.gender.alias("gender"),
            boxes.c.tag_ids,
            fn.COUNT(boxes.c.id).alias("boxes_count"),
            fn.SUM(boxes.c.number_of_items).alias("items_count"),
        )
        .from_(boxes)
        .join(
            Location,
            on=(
                (boxes.c.location_id == Location.id)
                & (Location.base == base_id)
                & (Location.deleted_on.is_null())
            ),
        )
        .join(Product, on=(boxes.c.product_id == Product.id))
        .left_outer_join(Unit, on=(boxes.c.display_unit_id == Unit.id))
        .group_by(
            SQL("size_id"),
            SQL("location_id"),
            SQL("box_state"),
            SQL("category_id"),
            SQL("product_name"),
            SQL("absolute_measure_value"),
            SQL("dimension_id"),
            SQL("gender"),
            SQL("tag_ids"),
        )
        .dicts()
    )
    for fact in facts:
        fact["tag_ids"] = sorted(convert_ids(fact["tag_ids"]))
    dimensions = _generate_dimensions(
        "size", "location", "category", "tag", "dimension", facts=facts
    )
    return DataCube(facts=facts, dimensions=dimensions, type="StockOverviewData")


def create_shareable_link(
    *, user_id, base_id, view, valid_until=None, url_parameters=None
):
    """Insert information for a new shareable link. Create unique SHA256 hex-code of
    length 64 from input data and additional (random) info.
    `valid-until` defaults to the date one week from now.
    """
    now = utcnow()
    if valid_until is None:
        valid_until = now + timedelta(weeks=1)
    elif valid_until < now:
        return InvalidDate(date=valid_until)

    short_code = "".join(random.choices(string.ascii_letters, k=8))
    full_code = hashlib.sha256(
        bytes(user_id)
        + bytes(base_id)
        + view.name.encode()
        + valid_until.isoformat().encode()
        + now.isoformat().encode()
        + short_code.encode(),
        usedforsecurity=False,
    )
    if url_parameters:
        full_code.update(url_parameters.encode())

    return ShareableLink.create(
        code=full_code.hexdigest(),
        base=base_id,
        view=view,
        valid_until=valid_until,
        url_parameters=url_parameters,
        created_on=now,
        created_by=user_id,
    )
