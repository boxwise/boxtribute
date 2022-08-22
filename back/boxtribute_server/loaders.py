from collections import defaultdict

from aiodataloader import DataLoader

from .enums import TaggableObjectType
from .models.definitions.product import Product
from .models.definitions.product_category import ProductCategory
from .models.definitions.size import Size
from .models.definitions.size_range import SizeRange
from .models.definitions.tag import Tag
from .models.definitions.tags_relation import TagsRelation


class ProductLoader(DataLoader):
    async def batch_load_fn(self, keys):
        products = {p.id: p for p in Product.select().where(Product.id << keys)}
        return [products.get(i) for i in keys]


class SizeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        sizes = {s.id: s for s in Size.select()}
        return [sizes.get(i) for i in keys]


class TagsForBoxLoader(DataLoader):
    async def batch_load_fn(self, keys):
        tags = defaultdict(list)
        # maybe need different join type
        for relation in (
            TagsRelation.select()
            .join(Tag)
            .where(TagsRelation.object_type == TaggableObjectType.Box)
        ):
            tags[relation.object_id].append(relation.tag)

        # Keys are in fact box IDs. Return empty list if box has no tags assigned
        return [tags.get(i, []) for i in keys]


class ProductCategoryLoader(DataLoader):
    async def batch_load_fn(self, keys):
        categories = {c.id: c for c in ProductCategory.select()}
        return [categories.get(i) for i in keys]


class SizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        ranges = {s.id: s for s in SizeRange.select()}
        return [ranges.get(i) for i in keys]


class SizesForSizeRangeLoader(DataLoader):
    async def batch_load_fn(self, keys):
        # Mapping of size range ID to list of sizes
        sizes = defaultdict(list)
        for size in Size.select():
            sizes[size.size_range_id].append(size)
        # Keys are in fact size range IDs. Return empty list if size range has no sizes
        return [sizes.get(i, []) for i in keys]
