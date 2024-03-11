from collections import defaultdict
from datetime import datetime
from functools import partial

from aiodataloader import DataLoader as _DataLoader
from peewee import SQL, Case, NodeList, fn

from ..authz import authorize, authorized_bases_filter
from ..db import db
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
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation
from ..models.definitions.transfer_agreement import TransferAgreement
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

    def __init__(self, model, skip_authorize=False):
        super().__init__()
        self.model = model
        self.skip_authorize = skip_authorize

    async def batch_load_fn(self, ids):
        if not self.skip_authorize:
            resource = convert_pascal_to_snake_case(self.model.__name__)
            permission = f"{resource}:read"
            authorize(permission=permission)

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
                & (authorized_bases_filter(Tag))
            ),
        ):
            tags[relation.object_id].append(relation.tag)

        # Keys are in fact box IDs. Return empty list if box has no tags assigned
        return [tags.get(i, []) for i in keys]


class HistoryForBoxLoader(DataLoader):
    async def batch_load_fn(self, box_ids):
        History = DbChangeHistory.alias()
        ToProduct = Product.alias()
        ToLocation = Location.alias()
        ToSize = Size.alias()
        ToBoxState = BoxState.alias()

        # Increase the default of 1024 (would be exceeded for concat'ing the change_date
        # column of a box with 54 or more history entries).
        db.database.execute_sql("SET SESSION group_concat_max_len = 10000;")
        # Return formatted history entries of boxes with given IDs, sorted by most
        # recent first.
        # Group history entry IDs, change dates, user IDs, and formatted messages for
        # each box. Convert these into Python lists of appropriate data type
        result = (
            History.select(
                # This translates to 'GROUP_CONCAT(h.id ORDER BY h.id DESC)'
                fn.GROUP_CONCAT(
                    NodeList(((History.id, SQL("ORDER BY"), History.id.desc())))
                )
                .python_value(convert_ids)
                .alias("ids"),
                fn.GROUP_CONCAT(
                    NodeList(
                        ((History.change_date, SQL("ORDER BY"), History.id.desc()))
                    )
                )
                .python_value(partial(convert_ids, converter=datetime.fromisoformat))
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
                                            (History.changes.startswith("comments")),
                                            fn.REPLACE(
                                                History.changes,
                                                "comments changed",
                                                "changed comments",
                                            ),
                                        ),
                                        (
                                            (History.changes.startswith("Record")),
                                            fn.REPLACE(
                                                History.changes,
                                                "Record created",
                                                "created record",
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
                    (Product.id == History.from_int) & (History.changes == "product_id")
                ),
            )
            .left_outer_join(
                ToProduct,
                on=(
                    (ToProduct.id == History.to_int) & (History.changes == "product_id")
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
            .dicts()
        )

        # Construct mapping of box IDs and their history information
        box_histories = {}
        for row in result:
            box_histories[row["record_id"]] = [
                DbChangeHistory(id=i, user=u, changes=c, change_date=d)
                for i, u, c, d in zip(
                    row["ids"],
                    row["user_ids"],
                    row["messages"],
                    row["change_dates"],
                )
            ]

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


class SizesForSizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="size:read")
        # Mapping of size range ID to list of sizes
        sizes = defaultdict(list)
        for size in Size.select():
            sizes[size.size_range_id].append(size)
        # Keys are in fact size range IDs. Return empty list if size range has no sizes
        return [sizes.get(i, []) for i in keys]
