from peewee import JOIN, SQL, fn

from ...db import db
from ...enums import BoxState, HumanGender, TaggableObjectType, TargetType
from ...models.definitions.base import Base
from ...models.definitions.beneficiary import Beneficiary
from ...models.definitions.box import Box
from ...models.definitions.box_state import BoxState as BoxStateModel
from ...models.definitions.history import DbChangeHistory
from ...models.definitions.location import Location
from ...models.definitions.product import Product
from ...models.definitions.product_category import ProductCategory
from ...models.definitions.shipment import Shipment
from ...models.definitions.shipment_detail import ShipmentDetail
from ...models.definitions.size import Size
from ...models.definitions.tag import Tag
from ...models.definitions.tags_relation import TagsRelation
from ...models.definitions.transaction import Transaction
from ...models.utils import compute_age, convert_ids


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

    if target_type is not None:
        target_ids = {f["target_id"] for f in facts}
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
    gender = fn.IF(Beneficiary.gender == "", "D", Beneficiary.gender)
    created_on = db.database.truncate_date("day", Beneficiary.created_on)
    age = fn.IF(
        Beneficiary.date_of_birth > 0, compute_age(Beneficiary.date_of_birth), None
    )
    tag_ids = fn.GROUP_CONCAT(TagsRelation.tag).python_value(convert_ids)

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
        .where(
            Beneficiary.deleted.is_null(),
            Beneficiary.base == base_id,
        )
        .group_by(SQL("gender"), SQL("age"), SQL("created_on"))
        .dicts()
    )

    # Conversions for GraphQL interface
    for row in demographics:
        row["gender"] = HumanGender(row["gender"])
        if row["created_on"] is not None:
            row["created_on"] = row["created_on"].date()

    dimensions = _generate_dimensions("tag", facts=demographics)
    return {"facts": demographics, "dimensions": dimensions}


def compute_created_boxes(base_id):
    """For each combination of product ID, category ID, gender, and day-truncated
    creation date count the number of created boxes, and the contained items, in the
    base with the specified ID.
    Return fact and dimension tables in the result.
    """
    selection = (
        Box.select(
            Box.created_on.alias("created_on"),
            Product.id.alias("product_id"),
            Product.gender.alias("gender"),
            Product.category.alias("category_id"),
            fn.COUNT(Box.id).alias("boxes_count"),
            fn.SUM(Box.number_of_items).alias("items_count"),
        )
        .join(Product)
        .order_by(Box.created_on.asc())
    )

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
        Transaction.created_on.alias("checked_out_on"),
        Transaction.product.alias("product_id"),
        Product.category.alias("category_id"),
        fn.SUM(Transaction.count).alias("items_count"),
    ).join(
        Product, on=((Product.base == base_id) & (Transaction.product == Product.id))
    )
    facts = (
        selection.group_by(SQL("product_id"), SQL("category_id"), SQL("checked_out_on"))
        .order_by(SQL("items_count").desc())
        .dicts()
    )

    # Data transformations
    for rank, row in enumerate(facts, start=1):
        row["rank"] = rank
        row["checked_out_on"] = row["checked_out_on"].date()

    dimensions = _generate_dimensions("category", "product", facts=facts)
    dimensions["size"] = None
    return {"facts": facts, "dimensions": dimensions}


def compute_top_products_donated(base_id):
    """Return list of most-donated products with rank included, grouped by distribution
    date, creation date, size, and product category.
    """
    selection = (
        DbChangeHistory.select(
            Box.created_on.alias("created_on"),
            DbChangeHistory.change_date.alias("donated_on"),
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
            SQL("donated_on"),
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
        row["donated_on"] = row["donated_on"].date()
        row["created_on"] = row["created_on"].date()

    dimensions = _generate_dimensions("category", "product", "size", facts=facts)
    return {"facts": facts, "dimensions": dimensions}


def compute_moved_boxes(base_id):
    """Count all boxes moved to locations in the given base, grouped by date of
    movement, product category, and box state.
    """
    # Similar to example from
    # https://docs.peewee-orm.com/en/latest/peewee/relationships.html#subqueries
    # Subquery to select record IDs and latest dates when box state was changed from
    # InStock to Donated.
    LatestMoved = DbChangeHistory.alias()
    LatestMovedSubQuery = (
        LatestMoved.select(
            LatestMoved.record_id,
            fn.MAX(LatestMoved.change_date).alias("move_date"),
        )
        .where(
            (LatestMoved.table_name == Box._meta.table_name),
            (LatestMoved.changes == Box.state.column_name),
            (LatestMoved.from_int == BoxState.InStock),
            (LatestMoved.to_int == BoxState.Donated),
        )
        .group_by(LatestMoved.record_id)
        .alias("sq")
    )

    # This selects only information of boxes that were moved from InStock to Donated
    # state, and are now in the base of given base ID. It is NOT taken into account that
    # boxes can be moved back from Donated to InStock, nor that the product or other
    # attributes of the box change after having been donated
    selection = (
        DbChangeHistory.select(
            DbChangeHistory.change_date.alias("moved_on"),
            Location.name.alias("target_id"),
            Product.category.alias("category_id"),
            fn.COUNT(Box.id).alias("boxes_count"),
        )
        .join(
            LatestMovedSubQuery,
            on=(
                (DbChangeHistory.record_id == LatestMovedSubQuery.c.record_id)
                & (DbChangeHistory.change_date == LatestMovedSubQuery.c.move_date)
            ),
        )
        .join(
            Box,
            on=((DbChangeHistory.record_id == Box.id)),
            src=DbChangeHistory,
        )
        .join(
            Product,
            on=((Box.product == Product.id) & (Product.base == base_id)),
        )
        .join(
            Location,
            src=Box,
            on=((Box.location == Location.id) & (Location.base == base_id)),
        )
    )
    donated_boxes_facts = selection.group_by(
        SQL("moved_on"),
        SQL("target_id"),
        SQL("category_id"),
    ).dicts()

    # Select information about all boxes sent from the specified base as source, that
    # were not removed from the shipment during preparation
    shipped_boxes_facts = (
        ShipmentDetail.select(
            Shipment.sent_on.alias("moved_on"),
            Product.category.alias("category_id"),
            Base.name.alias("target_id"),
            fn.COUNT(ShipmentDetail.box).alias("boxes_count"),
        )
        .join(
            Shipment,
            on=(
                (ShipmentDetail.shipment == Shipment.id)
                & (ShipmentDetail.removed_on.is_null())
                & (Shipment.source_base == base_id)
                & (Shipment.sent_on.is_null(False))
            ),
        )
        .join(
            Base,
            on=(Shipment.target_base == Base.id),
        )
        .join(
            Product,
            src=ShipmentDetail,
            on=(ShipmentDetail.source_product == Product.id),
        )
        .group_by(
            SQL("moved_on"),
            SQL("target_id"),
            SQL("category_id"),
        )
        .dicts()
    )

    # Collect information about boxes that were turned into Lost/Scrap state; it is
    # assumed that these boxes have not been further moved but still are part of the
    # specified base
    lost_scrap_box_facts = (
        DbChangeHistory.select(
            DbChangeHistory.change_date.alias("moved_on"),
            Product.category.alias("category_id"),
            BoxStateModel.label.alias("target_id"),
            fn.COUNT(DbChangeHistory.id).alias("boxes_count"),
        )
        .join(
            Box,
            on=(
                (DbChangeHistory.table_name == Box._meta.table_name)
                & (DbChangeHistory.changes == Box.state.column_name)
                & (DbChangeHistory.record_id == Box.id)
                & (DbChangeHistory.from_int == BoxState.InStock)
                & (DbChangeHistory.to_int << [BoxState.Lost, BoxState.Scrap])
            ),
        )
        .join(
            Product,
            on=((Box.product == Product.id) & (Product.base == base_id)),
        )
        .join(
            Location,
            src=Box,
            on=((Box.location == Location.id) & (Location.base == base_id)),
        )
        .join(
            BoxStateModel,
            src=DbChangeHistory,
            on=(DbChangeHistory.to_int == BoxStateModel.id),
        )
        .group_by(
            SQL("moved_on"),
            SQL("target_id"),
            SQL("category_id"),
        )
        .dicts()
    )
    facts = (
        list(donated_boxes_facts)
        + list(shipped_boxes_facts)
        + list(lost_scrap_box_facts)
    )

    # Conversions for GraphQL interface
    for row in facts:
        row["moved_on"] = row["moved_on"].date()

    dimensions = _generate_dimensions("category", facts=facts)
    dimensions["target"] = (
        _generate_dimensions(
            target_type=TargetType.OutgoingLocation,
            facts=donated_boxes_facts,
        )["target"]
        + _generate_dimensions(
            target_type=TargetType.Shipment,
            facts=shipped_boxes_facts,
        )["target"]
        + _generate_dimensions(
            target_type=TargetType.BoxState,
            facts=lost_scrap_box_facts,
        )["target"]
    )
    return {"facts": facts, "dimensions": dimensions}


def compute_stock_overview(base_id):
    """Compute stock overview (number of boxes and number of contained items) for the
    given base. The result can be filtered by size, location, box state, product
    category, product name, and product gender.
    """
    tag_ids = fn.GROUP_CONCAT(TagsRelation.tag).python_value(convert_ids)

    facts = (
        Box.select(
            Box.size.alias("size_id"),
            Box.location.alias("location_id"),
            Box.state.alias("box_state"),
            Product.category.alias("category_id"),
            Product.name.alias("product_name"),
            Product.gender.alias("gender"),
            tag_ids.alias("tag_ids"),
            fn.COUNT(Box.id).alias("boxes_count"),
            fn.SUM(Box.number_of_items).alias("items_count"),
        )
        .join(
            Location,
            on=((Box.location == Location.id) & (Location.base == base_id)),
        )
        .join(Product, src=Box)
        .join(
            TagsRelation,
            JOIN.LEFT_OUTER,
            src=Box,
            on=(
                (TagsRelation.object_id == Box.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
            ),
        )
        .group_by(
            SQL("size_id"),
            SQL("location_id"),
            SQL("box_state"),
            SQL("category_id"),
            SQL("product_name"),
            SQL("gender"),
        )
        .dicts()
    )
    dimensions = _generate_dimensions(
        "size", "location", "category", "tag", facts=facts
    )
    return {"facts": facts, "dimensions": dimensions}
