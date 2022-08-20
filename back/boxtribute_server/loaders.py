from collections import defaultdict

from aiodataloader import DataLoader

from .enums import TaggableObjectType
from .models.definitions.product import Product
from .models.definitions.size import Size
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

        # keys are in fact box IDs. Return empty list if box has no tags assigned
        return [tags.get(i, []) for i in keys]
