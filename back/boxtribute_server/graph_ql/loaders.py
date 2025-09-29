from collections import defaultdict
from datetime import datetime
from functools import partial

from aiodataloader import DataLoader as _DataLoader
from peewee import SQL, Case, NodeList, fn

from ..authz import authorize, authorized_bases_filter
from ..db import db
from ..enums import BoxState as BoxStateEnum
from ..enums import TaggableObjectType
from ..models.definitions.base import Base
from ..models.definitions.box import Box
from ..models.definitions.box_state import BoxState
from ..models.definitions.history import DbChangeHistory
from ..models.definitions.location import Location
from ..models.definitions.organisation import Organisation
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.shipment import Shipment
from ..models.definitions.shipment_detail import ShipmentDetail
from ..models.definitions.size import Size
from ..models.definitions.size_range import SizeRange
from ..models.definitions.standard_product import StandardProduct
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation
from ..models.definitions.transfer_agreement import TransferAgreement
from ..models.definitions.transfer_agreement_detail import TransferAgreementDetail
from ..models.definitions.unit import Unit
from ..models.definitions.user import User
from ..models.utils import convert_ids
from ..utils import convert_pascal_to_snake_case


class DataLoader(_DataLoader):
    """Custom implementation with a load() method that is able to handle None-keys."""

    def load(self, key):
        if key is None:
            return
        return super().load(key)


class SimpleDataLoader(DataLoader):
    """Custom implementation that batch-loads all requested rows of the specified data
    model, optionally enforcing authorization for the resource.
    Authorization may be skipped for base-specific resources.
    """

    def __init__(self, model, skip_authorize=False, permission=None):
        super().__init__()
        self.model = model
        self.skip_authorize = skip_authorize
        self.permission = permission
        if not self.permission:
            resource = convert_pascal_to_snake_case(self.model.__name__)
            self.permission = f"{resource}:read"

    async def batch_load_fn(self, ids):
        if not self.skip_authorize:
            authorize(permission=self.permission)

        rows = {r.id: r for r in self.model.select().where(self.model.id << ids)}
        return [rows.get(i) for i in ids]


class BaseLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Base, skip_authorize=True)


class ProductLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Product, skip_authorize=True)


class LocationLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Location, skip_authorize=True)


class BoxLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Box, skip_authorize=True)


class TransferAgreementLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(TransferAgreement, skip_authorize=True)


class SizeLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Size)


class UnitLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Unit)


class OrganisationLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(Organisation)


class UserLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(User)


class ProductCategoryLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(ProductCategory)


class SizeRangeLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(SizeRange)


class StandardProductLoader(SimpleDataLoader):
    def __init__(self):
        super().__init__(StandardProduct)


class ShipmentLoader(DataLoader):
    async def batch_load_fn(self, keys):
        shipments = {
            s.id: s
            for s in Shipment.select().orwhere(
                authorized_bases_filter(Shipment, base_fk_field_name="source_base_id"),
                authorized_bases_filter(Shipment, base_fk_field_name="target_base_id"),
            )
        }
        return [shipments.get(i) for i in keys]


async def load_agreement_bases(*, type, agreement_ids):
    source_bases = defaultdict(list)
    base_ids = []
    for base in (
        Base.select(Base, TransferAgreementDetail.transfer_agreement)
        .join(
            TransferAgreementDetail,
            on=((TransferAgreementDetail.source_base == Base.id)),
        )
        .where(
            TransferAgreementDetail.transfer_agreement << agreement_ids,
        )
        .distinct()
    ):
        source_bases[base.source_base.transfer_agreement_id].append(base)
        base_ids.append(base.id)

    target_bases = defaultdict(list)
    for base in (
        Base.select(Base, TransferAgreementDetail.transfer_agreement)
        .join(
            TransferAgreementDetail,
            on=((TransferAgreementDetail.target_base == Base.id)),
        )
        .where(
            TransferAgreementDetail.transfer_agreement << agreement_ids,
        )
        .distinct()
    ):
        target_bases[base.target_base.transfer_agreement_id].append(base)
        base_ids.append(base.id)
    authorize(permission="base:read", base_ids=base_ids)
    if type == "source":
        return [source_bases.get(i, []) for i in agreement_ids]
    return [target_bases.get(i, []) for i in agreement_ids]


class SourceBasesForAgreementLoader(DataLoader):
    async def batch_load_fn(self, agreement_ids):
        return await load_agreement_bases(type="source", agreement_ids=agreement_ids)


class TargetBasesForAgreementLoader(DataLoader):
    async def batch_load_fn(self, agreement_ids):
        return await load_agreement_bases(type="target", agreement_ids=agreement_ids)


class ShipmentsForAgreementLoader(DataLoader):
    async def batch_load_fn(self, agreement_ids):
        # Select all shipments with given agreement IDs that the user is authorized for,
        # and group them by agreement ID
        shipments = defaultdict(list)
        for shipment in Shipment.select().where(
            Shipment.transfer_agreement << agreement_ids,
            authorized_bases_filter(Shipment, base_fk_field_name="source_base")
            | authorized_bases_filter(Shipment, base_fk_field_name="target_base"),
        ):
            shipments[shipment.transfer_agreement_id].append(shipment)
        # Return empty list if agreement has no shipments attached
        return [shipments.get(i, []) for i in agreement_ids]


class TagsForBoxLoader(DataLoader):
    async def batch_load_fn(self, keys):
        tags = defaultdict(list)
        # maybe need different join type
        for relation in TagsRelation.select(
            TagsRelation.object_type, TagsRelation.object_id, Tag
        ).join(
            Tag,
            on=(
                (TagsRelation.tag == Tag.id)
                & (TagsRelation.object_type == TaggableObjectType.Box)
                & (TagsRelation.object_id << keys)
                & (TagsRelation.deleted_on.is_null())
                & (authorized_bases_filter(Tag))
            ),
        ):
            tags[relation.object_id].append(relation.tag)

        # Keys are in fact box IDs. Return empty list if box has no tags assigned
        return [sorted(tags.get(i, []), key=lambda t: t.id) for i in keys]


class HistoryForBoxLoader(DataLoader):
    async def batch_load_fn(self, box_ids):
        History = DbChangeHistory.alias()
        ToProduct = Product.alias()
        ToLocation = Location.alias()
        ToSize = Size.alias()
        ToBoxState = BoxState.alias()
        ToUnit = Unit.alias()

        # Subquery to exclude assigned-tag messages at the time of box creation
        CreatedTagsRelation = (
            TagsRelation.select(
                fn.CONCAT("ta", TagsRelation.id).alias("change_id"),
                TagsRelation.created_on,
                TagsRelation.created_by,
                fn.CONCAT("assigned tag '", Tag.name, "' to box").alias("message"),
                TagsRelation.object_id,
            )
            .join(Tag)
            .join(
                Box,
                on=(
                    (TagsRelation.object_id == Box.id)
                    & (TagsRelation.object_type == TaggableObjectType.Box),
                ),
            )
            .where(
                TagsRelation.created_on != Box.created_on,
                TagsRelation.created_on.is_null(False),
            )
        )

        # Increase the default of 1024 (would be exceeded for concat'ing the change_date
        # column of a box with 54 or more history entries).
        db.database.execute_sql("SET SESSION group_concat_max_len = 10000;")
        # Return formatted history entries of boxes with given IDs, sorted by most
        # recent first.
        # Group history entry IDs, change dates, user IDs, and formatted messages for
        # each box. Convert these into Python lists of appropriate data type
        result = (
            (
                History.select(
                    # This translates to 'GROUP_CONCAT(h.id ORDER BY h.id DESC)'
                    fn.GROUP_CONCAT(
                        NodeList((History.id, SQL("ORDER BY"), History.id.desc()))
                    )
                    .python_value(partial(convert_ids, converter=str))
                    .alias("ids"),
                    fn.GROUP_CONCAT(
                        NodeList(
                            (History.change_date, SQL("ORDER BY"), History.id.desc())
                        )
                    )
                    .python_value(
                        partial(convert_ids, converter=datetime.fromisoformat)
                    )
                    .alias("change_dates"),
                    fn.GROUP_CONCAT(
                        NodeList(
                            (
                                (
                                    fn.IFNULL(History.user, SQL("NULL")),
                                    SQL("ORDER BY"),
                                    History.id.desc(),
                                )
                            )
                        )
                    )
                    .python_value(convert_ids)
                    .alias("user_ids"),
                    fn.GROUP_CONCAT(
                        NodeList(
                            (
                                (
                                    Case(
                                        None,
                                        (
                                            (
                                                (History.changes == "location_id"),
                                                fn.CONCAT(
                                                    "changed box location from ",
                                                    Location.name,
                                                    " to ",
                                                    ToLocation.name,
                                                ),
                                            ),
                                            (
                                                (History.changes == "product_id"),
                                                fn.CONCAT(
                                                    "changed product type from ",
                                                    Product.name,
                                                    " to ",
                                                    ToProduct.name,
                                                ),
                                            ),
                                            (
                                                (History.changes == "size_id"),
                                                fn.CONCAT(
                                                    "changed size from ",
                                                    Size.label,
                                                    " to ",
                                                    ToSize.label,
                                                ),
                                            ),
                                            (
                                                (History.changes == "display_unit_id"),
                                                fn.CONCAT(
                                                    "changed unit from ",
                                                    Unit.symbol,
                                                    " to ",
                                                    ToUnit.symbol,
                                                ),
                                            ),
                                            (
                                                (History.changes == "box_state_id"),
                                                fn.CONCAT(
                                                    "changed box state from ",
                                                    BoxState.label,
                                                    " to ",
                                                    ToBoxState.label,
                                                ),
                                            ),
                                            (
                                                (History.changes == "items"),
                                                fn.CONCAT(
                                                    "changed the number of items from ",
                                                    History.from_int,
                                                    " to ",
                                                    History.to_int,
                                                ),
                                            ),
                                            (
                                                (
                                                    History.changes.startswith(
                                                        "comments"
                                                    )
                                                ),
                                                fn.REPLACE(
                                                    History.changes,
                                                    "comments changed",
                                                    "changed comments",
                                                ),
                                            ),
                                            (
                                                # Convert "Record created/deleted"
                                                # into "created/deleted record"
                                                (History.changes.startswith("Record")),
                                                fn.CONCAT(
                                                    fn.SUBSTRING(History.changes, 8),
                                                    " record",
                                                ),
                                            ),
                                        ),
                                        History.changes,
                                    ),
                                    SQL("ORDER BY"),
                                    History.id.desc(),
                                )
                            )
                        )
                    )
                    .python_value(partial(convert_ids, converter=str))
                    .alias("messages"),
                    History.record_id,
                )
                .left_outer_join(
                    Product,
                    on=(
                        (Product.id == History.from_int)
                        & (History.changes == "product_id")
                    ),
                )
                .left_outer_join(
                    ToProduct,
                    on=(
                        (ToProduct.id == History.to_int)
                        & (History.changes == "product_id")
                    ),
                )
                .left_outer_join(
                    Location,
                    on=(
                        (Location.id == History.from_int)
                        & (History.changes == "location_id")
                    ),
                )
                .left_outer_join(
                    ToLocation,
                    on=(
                        (ToLocation.id == History.to_int)
                        & (History.changes == "location_id")
                    ),
                )
                .left_outer_join(
                    Size,
                    on=((Size.id == History.from_int) & (History.changes == "size_id")),
                )
                .left_outer_join(
                    ToSize,
                    on=((ToSize.id == History.to_int) & (History.changes == "size_id")),
                )
                .left_outer_join(
                    Unit,
                    on=(
                        (Unit.id == History.from_int)
                        & (History.changes == "display_unit_id")
                    ),
                )
                .left_outer_join(
                    ToUnit,
                    on=(
                        (ToUnit.id == History.to_int)
                        & (History.changes == "display_unit_id")
                    ),
                )
                .left_outer_join(
                    BoxState,
                    on=(
                        (BoxState.id == History.from_int)
                        & (History.changes == "box_state_id")
                    ),
                )
                .left_outer_join(
                    ToBoxState,
                    on=(
                        (ToBoxState.id == History.to_int)
                        & (History.changes == "box_state_id")
                    ),
                )
                .where(History.table_name == "stock", History.record_id << box_ids)
                .group_by(History.record_id)
            )
            + (
                # Information about tag assignments
                TagsRelation.select(
                    fn.GROUP_CONCAT(CreatedTagsRelation.c.change_id).alias("ids"),
                    fn.GROUP_CONCAT(CreatedTagsRelation.c.created_on).alias(
                        "change_dates"
                    ),
                    fn.GROUP_CONCAT(CreatedTagsRelation.c.created_by_id).alias(
                        "user_ids"
                    ),
                    fn.GROUP_CONCAT(CreatedTagsRelation.c.message).alias("messages"),
                    CreatedTagsRelation.c.object_id.alias("record_id"),
                )
                .from_(CreatedTagsRelation)
                .group_by(CreatedTagsRelation.c.object_id)
            )
            + (
                # Information about all tag removals
                TagsRelation.select(
                    fn.GROUP_CONCAT(fn.CONCAT("tr", TagsRelation.id)).alias("ids"),
                    fn.GROUP_CONCAT(TagsRelation.deleted_on).alias("change_dates"),
                    fn.GROUP_CONCAT(TagsRelation.deleted_by).alias("user_ids"),
                    fn.GROUP_CONCAT(
                        fn.CONCAT("removed tag '", Tag.name, "' from box")
                    ).alias("messages"),
                    TagsRelation.object_id.alias("record_id"),
                )
                .join(Tag)
                .where(
                    TagsRelation.object_type == TaggableObjectType.Box,
                    TagsRelation.deleted_on.is_null(False),
                )
                .group_by(TagsRelation.object_id)
            )
        )

        # Construct mapping of box IDs and their history information
        box_histories = defaultdict(list)
        for row in result.dicts():
            box_histories[row["record_id"]].extend(
                [
                    DbChangeHistory(id=i, user=u, changes=c, change_date=d)
                    for i, u, c, d in zip(
                        row["ids"],
                        row["user_ids"],
                        row["messages"],
                        row["change_dates"],
                    )
                ]
            )
        # Sort combined history by change date, newest first
        for box_id, history in box_histories.items():
            box_histories[box_id] = sorted(
                history, key=lambda e: e.change_date, reverse=True
            )

        return [box_histories.get(i, []) for i in box_ids]


class ShipmentDetailsForShipmentLoader(DataLoader):
    async def batch_load_fn(self, shipment_ids):
        authorize(permission="shipment_detail:read")
        # Select all details with given shipments IDs that the user is authorized for,
        # and group them by shipment ID.
        # Join with Shipment model, such that authorization in ShipmentDetail resolvers
        # (detail.shipment.source_base_id) don't create additional DB queries
        details = defaultdict(list)
        for detail in (
            ShipmentDetail.select(ShipmentDetail, Shipment)
            .join(Shipment)
            .where(ShipmentDetail.shipment << shipment_ids)
        ):
            details[detail.shipment_id].append(detail)
        # Return empty list if shipment has no details attached
        return [details.get(i, []) for i in shipment_ids]


class ShipmentDetailForBoxLoader(DataLoader):
    async def batch_load_fn(self, keys):
        details = {
            detail.box_id: detail
            for detail in ShipmentDetail.select().where(
                ShipmentDetail.box << keys,
                ShipmentDetail.removed_on.is_null(),
                ShipmentDetail.lost_on.is_null(),
                ShipmentDetail.received_on.is_null(),
            )
        }
        # Keys are in fact box IDs. Return None if box has no shipment detail associated
        return [details.get(i) for i in keys]


class ItemsCountForProductLoader(DataLoader):
    box_states: list[BoxStateEnum] | None = None

    async def batch_load_fn(self, product_ids):
        counts = {
            product.product_id: product.total_number_of_items
            for product in Box.select(
                Box.product,
                fn.SUM(Box.number_of_items).alias("total_number_of_items"),
            )
            .where(
                Box.product << product_ids,
                Box.state << self.box_states,
                (Box.deleted_on.is_null() | ~Box.deleted_on),
            )
            .group_by(Box.product)
        }
        return [counts.get(i, 0) for i in product_ids]


class InstockItemsCountForProductLoader(ItemsCountForProductLoader):
    box_states = [BoxStateEnum.InStock]


class TransferItemsCountForProductLoader(ItemsCountForProductLoader):
    box_states = [
        BoxStateEnum.MarkedForShipment,
        BoxStateEnum.InTransit,
        BoxStateEnum.Receiving,
    ]


class SizesForSizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="size:read")
        # Mapping of size range ID to list of sizes
        sizes = defaultdict(list)
        for size in Size.select():
            sizes[size.size_range_id].append(size)
        # Keys are in fact size range IDs. Return empty list if size range has no sizes
        return [sizes.get(i, []) for i in keys]


class UnitsForDimensionLoader(DataLoader):
    async def batch_load_fn(self, keys):
        # Mapping of size range ID (dimension) to list of units
        units = defaultdict(list)
        for unit in Unit.select().iterator():
            units[unit.dimension_id].append(unit)
        return [units.get(i, []) for i in keys]


class ShipmentDetailAutoMatchingLoader(DataLoader):
    async def batch_load_fn(self, detail_ids):
        # Obtain info about target base and source products of involved shipment details
        ShipmentInfo = (
            ShipmentDetail.select(
                ShipmentDetail.id.alias("detail_id"),
                ShipmentDetail.source_product,
                Shipment.target_base.alias("target_base"),
            ).join(
                Shipment,
                on=(
                    (ShipmentDetail.shipment == Shipment.id)
                    & (ShipmentDetail.id << (detail_ids))
                ),
            )
        ).cte("shipment_info")
        # If details originate from shipments with different target bases, this will
        # throw an error later
        target_base_id = ShipmentInfo.select(ShipmentInfo.c.target_base).distinct()

        TargetProduct = Product
        SourceProduct = Product.alias()
        result = (
            # Find all shipment details...
            SourceProduct.select(ShipmentInfo.c.detail_id, TargetProduct)
            .join(
                ShipmentInfo, on=(SourceProduct.id == ShipmentInfo.c.source_product_id)
            )
            .join(
                TargetProduct,
                on=(
                    # ...with matching standard products in source and target base
                    # (using INNER JOIN, hence filtering out all results with
                    # non-standard source products)
                    (TargetProduct.standard_product == SourceProduct.standard_product)
                    & (TargetProduct.base == target_base_id)
                    & ((TargetProduct.deleted_on.is_null()) | ~TargetProduct.deleted_on)
                ),
            )
            .with_cte(ShipmentInfo)
        )

        matching_target_products = {
            row.shipment_info["detail_id"]: row.product for row in result
        }
        # Return products ready to be matched in the target base, corresponding to given
        # shipment detail IDs
        return [matching_target_products.get(i) for i in detail_ids]
