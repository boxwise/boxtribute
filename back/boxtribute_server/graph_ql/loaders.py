from collections import defaultdict

from aiodataloader import DataLoader as _DataLoader

from ..authz import authorize, authorized_bases_filter
from ..enums import TaggableObjectType
from ..models.definitions.location import Location
from ..models.definitions.product import Product
from ..models.definitions.product_category import ProductCategory
from ..models.definitions.size import Size
from ..models.definitions.size_range import SizeRange
from ..models.definitions.tag import Tag
from ..models.definitions.tags_relation import TagsRelation


class DataLoader(_DataLoader):
    """Custom implementation with a load() method that is able to handle None-keys."""

    def load(self, key):
        if key is None:
            return
        return super().load(key)


class ProductLoader(DataLoader):
    async def batch_load_fn(self, keys):
        products = {
            p.id: p
            for p in Product.select().where(
                Product.id << keys, authorized_bases_filter(Product)
            )
        }
        return [products.get(i) for i in keys]


class LocationLoader(DataLoader):
    async def batch_load_fn(self, keys):
        locations = {
            loc.id: loc
            for loc in Location.select().where(
                Location.id << keys, authorized_bases_filter(Location)
            )
        }
        return [locations.get(i) for i in keys]


class SizeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="size:read")
        sizes = {s.id: s for s in Size.select()}
        return [sizes.get(i) for i in keys]


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


class ProductCategoryLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="category:read")
        categories = {c.id: c for c in ProductCategory.select()}
        return [categories.get(i) for i in keys]


class SizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="size_range:read")
        ranges = {s.id: s for s in SizeRange.select()}
        return [ranges.get(i) for i in keys]


class SizesForSizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        authorize(permission="size:read")
        # Mapping of size range ID to list of sizes
        sizes = defaultdict(list)
        for size in Size.select():
            sizes[size.size_range_id].append(size)
        # Keys are in fact size range IDs. Return empty list if size range has no sizes
        return [sizes.get(i, []) for i in keys]
