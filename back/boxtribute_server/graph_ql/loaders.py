from collections import defaultdict

from aiodataloader import DataLoader as _DataLoader

from ..authz import authorize, authorized_bases_filter
from ..enums import TaggableObjectType
from ..models.definitions.base import Base
from ..models.definitions.box import Box
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
from ..models.definitions.user import User
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
            # work-around for inconsistent RBP naming
            if resource == "product_category":
                resource = "category"
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


class TagsForBoxLoader(DataLoader):
    async def batch_load_fn(self, keys):
        tags = defaultdict(list)
        # maybe need different join type
        for relation in (
            TagsRelation.select(TagsRelation.object_type, TagsRelation.object_id, Tag)
            .join(Tag)
            .where(
                TagsRelation.object_type == TaggableObjectType.Box,
                TagsRelation.object_id << keys,
                authorized_bases_filter(Tag),
            )
        ):
            tags[relation.object_id].append(relation.tag)

        # Keys are in fact box IDs. Return empty list if box has no tags assigned
        return [tags.get(i, []) for i in keys]


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
